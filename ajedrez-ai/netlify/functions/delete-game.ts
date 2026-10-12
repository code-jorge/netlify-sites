import type { Context } from "@netlify/functions";
import { db } from "./lib/db.js";

export default async (_req: Request, context: Context) => {
  try {
    const id = (context.params as { id?: string }).id;
    if (!id) {
      return Response.json({ error: "Missing game id" }, { status: 400 });
    }

    // ON DELETE CASCADE on move_attempts.game_id removes the move log too.
    const deleted = await db.sql`
      DELETE FROM games WHERE id = ${id} RETURNING id
    `;
    if (deleted.length === 0) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }
    return Response.json({ ok: true, id: deleted[0].id });
  } catch (err) {
    console.error("delete-game error", err);
    return Response.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    );
  }
};

export const config = {
  path: "/api/games/:id",
  method: "DELETE",
};
