import type { Context } from "@netlify/functions";
import { Chess } from "chess.js";
import { db, type GameRow, type GameStatus, type Side } from "./lib/db.js";
import { proposeMove, type ChessContext } from "./lib/ai.js";

const MAX_ATTEMPTS_PER_PLY = 5;

const deriveStatus = (
  chess: Chess,
  side: Side,
): { status: GameStatus; reason: string | null } => {
  if (chess.isCheckmate()) {
    return {
      status: side === "white" ? "white_won" : "black_won",
      reason: "checkmate",
    };
  }
  if (chess.isStalemate()) return { status: "draw", reason: "stalemate" };
  if (chess.isInsufficientMaterial())
    return { status: "draw", reason: "insufficient_material" };
  if (chess.isThreefoldRepetition())
    return { status: "draw", reason: "threefold" };
  if (chess.isDraw()) return { status: "draw", reason: "fifty_move" };
  return { status: "in_progress", reason: null };
};

export default async (_req: Request, context: Context) => {
  try {
    const id = (context.params as { id?: string }).id;
    if (!id)
      return Response.json({ error: "Missing game id" }, { status: 400 });

    const games = (await db.sql`
      SELECT * FROM games WHERE id = ${id}
    `) as unknown as GameRow[];
    if (games.length === 0)
      return Response.json({ error: "Game not found" }, { status: 404 });

    const game = games[0];
    if (game.status !== "in_progress") {
      return Response.json(
        { error: `Game is already ${game.status}` },
        { status: 409 },
      );
    }

    const priorMoves = (await db.sql`
      SELECT san FROM move_attempts
      WHERE game_id = ${id} AND is_legal = TRUE
      ORDER BY ply ASC
    `) as unknown as { san: string }[];

    const chess = new Chess();
    for (const m of priorMoves) {
      try {
        chess.move(m.san);
      } catch {
        return Response.json(
          {
            error: `Stored move ${m.san} could not be replayed; game state corrupted.`,
          },
          { status: 500 },
        );
      }
    }

    const turn = chess.turn();
    const side: Side = turn === "w" ? "white" : "black";
    const model = side === "white" ? game.white_model : game.black_model;
    const systemPrompt =
      side === "white" ? game.white_prompt : game.black_prompt;

    const ply = priorMoves.length + 1;
    const fenBefore = chess.fen();
    const previousIllegalAttempts: { move: string; reason: string }[] = [];

    for (
      let attemptNumber = 1;
      attemptNumber <= MAX_ATTEMPTS_PER_PLY;
      attemptNumber++
    ) {
      const legalMoves = chess.moves();
      const ctx: ChessContext = {
        fen: fenBefore,
        side,
        legalMoves,
        history: chess.history(),
        previousIllegalAttempts,
      };

      let proposal;
      try {
        proposal = await proposeMove(model, systemPrompt, ctx);
      } catch (err) {
        const reason = `model_call_error: ${err instanceof Error ? err.message : String(err)}`;
        await db.sql`
          INSERT INTO move_attempts
            (game_id, ply, side, model, attempt_number, proposed_move, explanation, is_legal, illegality_reason, fen_before)
          VALUES
            (${id}, ${ply}, ${side}, ${model}, ${attemptNumber}, ${""}, ${null}, ${false}, ${reason}, ${fenBefore})
        `;
        previousIllegalAttempts.push({
          move: "(no parseable response)",
          reason,
        });
        continue;
      }

      let appliedSan: string | null = null;
      let illegalityReason: string | null = null;
      try {
        const moveResult = chess.move(proposal.move);
        if (moveResult) appliedSan = moveResult.san;
        else illegalityReason = "chess.js rejected move (returned null)";
      } catch (err) {
        illegalityReason = `chess.js rejected move: ${err instanceof Error ? err.message : String(err)}`;
      }

      if (appliedSan) {
        const fenAfter = chess.fen();
        const pgn = chess.pgn();
        const { status, reason } = deriveStatus(chess, side);

        await db.sql`
          INSERT INTO move_attempts
            (game_id, ply, side, model, attempt_number, proposed_move, explanation, is_legal, illegality_reason, fen_before, fen_after, san)
          VALUES
            (${id}, ${ply}, ${side}, ${model}, ${attemptNumber}, ${proposal.move}, ${proposal.explanation}, ${true}, ${null}, ${fenBefore}, ${fenAfter}, ${appliedSan})
        `;

        await db.sql`
          UPDATE games
          SET fen = ${fenAfter},
              pgn = ${pgn},
              status = ${status},
              result_reason = ${reason},
              updated_at = NOW()
          WHERE id = ${id}
        `;

        return Response.json({
          ok: true,
          side,
          model,
          ply,
          san: appliedSan,
          explanation: proposal.explanation,
          fen: fenAfter,
          pgn,
          status,
          resultReason: reason,
          illegalAttemptsThisPly: attemptNumber - 1,
        });
      }

      await db.sql`
        INSERT INTO move_attempts
          (game_id, ply, side, model, attempt_number, proposed_move, explanation, is_legal, illegality_reason, fen_before)
        VALUES
          (${id}, ${ply}, ${side}, ${model}, ${attemptNumber}, ${proposal.move}, ${proposal.explanation}, ${false}, ${illegalityReason}, ${fenBefore})
      `;
      previousIllegalAttempts.push({
        move: proposal.move,
        reason: illegalityReason ?? "unknown",
      });
    }

    await db.sql`
      UPDATE games
      SET status = 'abandoned',
          result_reason = 'max_illegal_attempts',
          updated_at = NOW()
      WHERE id = ${id}
    `;

    return Response.json({
      ok: false,
      side,
      model,
      ply,
      status: "abandoned",
      resultReason: "max_illegal_attempts",
      illegalAttemptsThisPly: MAX_ATTEMPTS_PER_PLY,
      illegalAttempts: previousIllegalAttempts,
    });
  } catch (err) {
    console.error("play-move error", err);
    return Response.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    );
  }
};

export const config = {
  path: "/api/games/:id/play",
  method: "POST",
};
