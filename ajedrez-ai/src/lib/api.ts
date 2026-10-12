export interface ModelEntry {
  id: string;
  label: string;
  provider: "anthropic" | "openai" | "google";
}

export interface ModelsResponse {
  defaultPrompt: string;
  models: ModelEntry[];
}

export interface GameSummary {
  id: string;
  white_model: string;
  black_model: string;
  status: string;
  result_reason: string | null;
  created_at: string;
  updated_at: string;
  move_count: number | string;
  illegal_count: number | string;
}

export interface GameDetail {
  id: string;
  white_model: string;
  black_model: string;
  white_prompt: string;
  black_prompt: string;
  fen: string;
  pgn: string;
  status: string;
  result_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoveRow {
  id: string;
  ply: number;
  side: "white" | "black";
  model: string;
  attempt_number: number;
  proposed_move: string;
  explanation: string | null;
  is_legal: boolean;
  illegality_reason: string | null;
  fen_before: string;
  fen_after: string | null;
  san: string | null;
  created_at: string;
}

export interface GameDetailResponse {
  game: GameDetail;
  moves: MoveRow[];
  illegalAttempts: MoveRow[];
  illegalCount: number;
}

// /api/games/:id/play is now a background function — it returns 202 Accepted
// immediately and does its work async. Clients must poll /api/games/:id to
// observe the resulting move (and any illegal attempts logged along the way).
export interface PlayAck {
  accepted: boolean;
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export const api = {
  models: () => fetch("/api/models").then((r) => jsonOrThrow<ModelsResponse>(r)),
  listGames: () =>
    fetch("/api/games").then((r) => jsonOrThrow<{ games: GameSummary[] }>(r)),
  getGame: (id: string) =>
    fetch(`/api/games/${id}`).then((r) => jsonOrThrow<GameDetailResponse>(r)),
  createGame: (input: {
    whiteModel: string;
    blackModel: string;
    whitePrompt: string;
    blackPrompt: string;
  }) =>
    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => jsonOrThrow<{ game: GameDetail }>(r)),
  deleteGame: (id: string) =>
    fetch(`/api/games/${id}`, { method: "DELETE" }).then((r) =>
      jsonOrThrow<{ ok: true; id: string }>(r),
    ),
  play: async (id: string): Promise<PlayAck> => {
    const r = await fetch(`/api/games/${id}/play`, { method: "POST" });
    // Background functions ack with 202 Accepted and no body.
    if (r.status === 202 || r.ok) return { accepted: true };
    let msg = `${r.status} ${r.statusText}`;
    try {
      const body = await r.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  },
};
