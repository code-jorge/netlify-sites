## Chess Bot Wars

Two AI models play chess against each other. You pick the models and the system prompts, then click **Play** to advance one ply. Every move proposal — legal or not — is persisted, so the game history and the count of illegal-move attempts are queryable end-to-end.

Built end-to-end on Netlify primitives:

- **Netlify AI Gateway** for LLM inference (Anthropic, OpenAI, Google) — no API keys to manage.
- **Netlify Database** (GA Postgres, `@netlify/database`) for game state and the move-attempt log. Auto-provisioned at deploy time; deploy previews fork off production data.
- **Netlify Functions** (v2 `Request`-style with per-function `path`/`method` config) for the API.
- **Vite + React + react-chessboard** for the UI.

### Stack at a glance

```
src/                              React UI (Vite)
  components/                     GameSetup, GameView, GameList, ProviderLogo, ModelLabel
  lib/api.ts                      Typed fetch client
netlify/functions/                API — each function declares its own path+method
  list-models.ts                  GET  /api/models
  list-games.ts                   GET  /api/games
  create-game.ts                  POST /api/games
  get-game.ts                     GET  /api/games/:id
  play-move.ts                    POST /api/games/:id/play
  lib/                            ai dispatcher, db client, model registry, models.json
netlify/database/migrations/      DB migrations — auto-applied by every deploy
  20260502120000_init/
    migration.sql                 games + move_attempts
```

### Setup

Requires **Netlify CLI 26.0.0+**.

```bash
npm install
netlify link             # link to the production site
netlify database init    # one-time: provisions the DB and binds it to this site
netlify dev              # local dev (Vite + functions on http://localhost:8888)
```

That's it. Because `@netlify/database` is in deps, every deploy auto-provisions/connects the DB and applies any pending migrations from `netlify/database/migrations/`. There is no manual schema-apply step against production.

### Local DB

Migrations don't auto-apply locally — when you start fresh, run:

```bash
netlify database migrations apply       # apply pending migrations to the local DB
netlify database status                 # show applied / pending migrations
netlify database connect --query "..."  # one-shot SQL against the local DB
```

### Adding a schema change

```bash
npm run db:new -- -d "describe the change"   # scaffolds netlify/database/migrations/<ts>_<slug>/migration.sql
$EDITOR netlify/database/migrations/<ts>_*/migration.sql
npm run db:apply                              # apply locally
git add netlify/database/migrations/<ts>_*
git commit && git push                        # deploy applies it to preview, then production
```

Schema changes go through migration files. Never `CREATE/ALTER/DROP` via `netlify database connect` — out-of-band DDL drifts the migration history. Once a migration has been applied anywhere, treat it as immutable and roll forward with a new one.

### How a "Play" click works

1. The UI calls `POST /api/games/:id/play`.
2. The function loads the game and replays every legal move from `move_attempts` to rebuild chess state with chess.js.
3. It works out whose turn it is, picks that side's model + system prompt, and asks the model — via the matching SDK (`@anthropic-ai/sdk`, `openai`, or `@google/genai`) — for a JSON `{move, explanation}`. The Netlify AI Gateway base-URL/key env vars are auto-injected, so each SDK is constructed with no arguments.
4. chess.js validates the SAN. If illegal, the attempt is logged with `is_legal = false` and an illegality reason; the model is re-prompted with the list of rejected attempts. Up to **5 attempts per ply**, then the game is marked `abandoned`.
5. On a legal move: the SAN is applied, `games.fen` / `games.pgn` are updated, terminal conditions (checkmate / stalemate / 50-move / threefold / insufficient material) are detected and `games.status` is set accordingly.

### Adding or swapping models

Edit `netlify/functions/lib/models.json` — each `id` must match an identifier supported by Netlify AI Gateway and the `provider` must be `anthropic`, `openai`, or `google`. The frontend reads this list through `/api/models`, so the UI updates as soon as the function bundle picks up the new file.

### Schema

- `games` — one row per match. Holds the two chosen models, both system prompts, current FEN, current PGN, status, and result reason.
- `move_attempts` — one row per LLM call, including illegal ones. `is_legal = TRUE` rows are the played moves; `is_legal = FALSE` rows are rejected attempts. Both feed the UI: legal rows render the move history; illegal rows render rejection details and drive the illegal-attempt counter.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/code-jorge/netlify-sites&base=ajedrez-ai)
