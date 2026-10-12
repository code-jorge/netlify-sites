CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS games (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  white_model     TEXT        NOT NULL,
  black_model     TEXT        NOT NULL,
  white_prompt    TEXT        NOT NULL,
  black_prompt    TEXT        NOT NULL,
  fen             TEXT        NOT NULL,
  pgn             TEXT        NOT NULL DEFAULT '',
  status          TEXT        NOT NULL DEFAULT 'in_progress',
  result_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS move_attempts (
  id                  BIGSERIAL   PRIMARY KEY,
  game_id             UUID        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  ply                 INT         NOT NULL,
  side                TEXT        NOT NULL,
  model               TEXT        NOT NULL,
  attempt_number      INT         NOT NULL,
  proposed_move       TEXT        NOT NULL,
  explanation         TEXT,
  is_legal            BOOLEAN     NOT NULL,
  illegality_reason   TEXT,
  fen_before          TEXT        NOT NULL,
  fen_after           TEXT,
  san                 TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_move_attempts_game_ply
  ON move_attempts(game_id, ply, attempt_number);

CREATE INDEX IF NOT EXISTS idx_move_attempts_legal
  ON move_attempts(game_id, is_legal);
