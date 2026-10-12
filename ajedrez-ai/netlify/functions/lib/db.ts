import { getDatabase } from "@netlify/database";

export const db = getDatabase();

export type Side = "white" | "black";
export type GameStatus =
  | "in_progress"
  | "white_won"
  | "black_won"
  | "draw"
  | "abandoned";

export interface GameRow {
  id: string;
  white_model: string;
  black_model: string;
  white_prompt: string;
  black_prompt: string;
  fen: string;
  pgn: string;
  status: GameStatus;
  result_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoveAttemptRow {
  id: string;
  game_id: string;
  ply: number;
  side: Side;
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
