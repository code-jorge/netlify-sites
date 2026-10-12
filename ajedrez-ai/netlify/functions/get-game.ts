import type { Context } from "@netlify/functions";
import { db } from "./lib/db.js";

export default async (_req: Request, context: Context) => {
  try {
    const id = (context.params as { id?: string }).id;
    if (!id) {
      return Response.json({ error: "Missing game id" }, { status: 400 });
    }

    const games = await db.sql`SELECT * FROM games WHERE id = ${id}`;
    if (games.length === 0) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }

    const attempts = await db.sql`
      SELECT * FROM move_attempts
      WHERE game_id = ${id}
      ORDER BY ply ASC, attempt_number ASC
    `;

    const legal = attempts.filter((a: any) => a.is_legal);
    const illegal = attempts.filter((a: any) => !a.is_legal);

    return Response.json({
      game: games[0],
      moves: legal,
      illegalAttempts: illegal,
      illegalCount: illegal.length,
    });
  } catch (err) {
    console.error("get-game error", err);
    return Response.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    );
  }
};

export const config = {
  path: "/api/games/:id",
  method: "GET",
};
