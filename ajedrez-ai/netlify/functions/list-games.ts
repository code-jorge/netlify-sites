import { db } from "./lib/db.js";

export default async () => {
  try {
    const rows = await db.sql`
      SELECT
        g.id,
        g.white_model,
        g.black_model,
        g.status,
        g.result_reason,
        g.created_at,
        g.updated_at,
        (
          SELECT COUNT(*) FROM move_attempts m
          WHERE m.game_id = g.id AND m.is_legal = TRUE
        ) AS move_count,
        (
          SELECT COUNT(*) FROM move_attempts m
          WHERE m.game_id = g.id AND m.is_legal = FALSE
        ) AS illegal_count
      FROM games g
      ORDER BY g.created_at DESC
      LIMIT 200
    `;
    return Response.json({ games: rows });
  } catch (err) {
    console.error("list-games error", err);
    return Response.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 },
    );
  }
};

export const config = {
  path: "/api/games",
  method: "GET",
};
