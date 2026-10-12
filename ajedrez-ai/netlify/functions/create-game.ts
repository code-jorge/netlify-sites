import { Chess } from "chess.js";
import { db } from "./lib/db.js";
import { DEFAULT_PROMPT, findModel } from "./lib/models.js";

interface CreateGameBody {
  whiteModel?: string;
  blackModel?: string;
  whitePrompt?: string;
  blackPrompt?: string;
}

export default async (req: Request) => {
  try {
    let body: CreateGameBody;
    try {
      body = (await req.json()) as CreateGameBody;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { whiteModel, blackModel } = body;
    if (!whiteModel || !blackModel) {
      return Response.json(
        { error: "whiteModel and blackModel are required" },
        { status: 400 },
      );
    }
    if (!findModel(whiteModel) || !findModel(blackModel)) {
      return Response.json(
        {
          error:
            "Unknown model id (must match netlify/functions/lib/models.json)",
        },
        { status: 400 },
      );
    }

    const whitePrompt = (body.whitePrompt ?? "").trim() || DEFAULT_PROMPT;
    const blackPrompt = (body.blackPrompt ?? "").trim() || DEFAULT_PROMPT;
    const startFen = new Chess().fen();

    const rows = await db.sql`
      INSERT INTO games (white_model, black_model, white_prompt, black_prompt, fen)
      VALUES (${whiteModel}, ${blackModel}, ${whitePrompt}, ${blackPrompt}, ${startFen})
      RETURNING *
    `;
    return Response.json({ game: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("create-game error", err);
    return Response.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    );
  }
};

export const config = {
  path: "/api/games",
  method: "POST",
};
