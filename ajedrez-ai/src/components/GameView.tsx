import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import {
  api,
  type GameDetailResponse,
  type ModelEntry,
  type MoveRow,
} from "../lib/api.js";
import { ModelLabel } from "./ModelLabel.js";
import { formatStatus } from "../lib/status.js";
import {
  PIECE_GLYPH,
  PIECE_LABEL,
  pieceFromSan,
} from "../lib/chess-pieces.js";
import { playMoveSound } from "../lib/sound.js";
import { useThinkingPhrase } from "../lib/thinking-phrases.js";
import styles from "./GameView.module.css";

interface Props {
  models: ModelEntry[];
}

const STARTING_FEN = new Chess().fen();

const STATUS_PILL: Record<string, string> = {
  in_progress: styles.statusInProgress,
  white_won: styles.statusWhiteWon,
  black_won: styles.statusBlackWon,
  draw: styles.statusDraw,
  abandoned: styles.statusAbandoned,
};

const SIDE_PILL: Record<"white" | "black", string> = {
  white: styles.sidePillWhite,
  black: styles.sidePillBlack,
};

const PIECE_ICON_SIDE: Record<"white" | "black", string> = {
  white: styles.pieceIconWhite,
  black: styles.pieceIconBlack,
};

export const GameView = ({ models }: Props) => {
  const { id, ply: plyParam } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<GameDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentMoveRef = useRef<HTMLLIElement | null>(null);
  const lastSeenMovesRef = useRef<{ id?: string; count: number }>({ count: 0 });

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.getGame(id);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setData(null);
    load();
  }, [id, load]);

  const moves = data?.moves ?? [];
  const totalPlies = moves.length;

  // Side that owns the next ply: white plays plies 1, 3, 5… (i.e. when an
  // even number of moves have been played).
  const nextSide: "white" | "black" =
    totalPlies % 2 === 0 ? "white" : "black";
  const nextModel = data
    ? nextSide === "white"
      ? data.game.white_model
      : data.game.black_model
    : null;

  const thinkingPhrase = useThinkingPhrase(playing);

  const isLatest = plyParam === undefined;
  const parsedPly = plyParam !== undefined ? Number.parseInt(plyParam, 10) : NaN;
  const currentPly = isLatest
    ? totalPlies
    : Number.isNaN(parsedPly)
      ? totalPlies
      : Math.max(0, Math.min(totalPlies, parsedPly));

  useEffect(() => {
    if (!data || isLatest || Number.isNaN(parsedPly)) return;
    if (parsedPly !== currentPly) {
      if (currentPly === totalPlies) navigate(`/games/${id}`, { replace: true });
      else navigate(`/games/${id}/${currentPly}`, { replace: true });
    }
  }, [data, isLatest, parsedPly, currentPly, totalPlies, id, navigate]);

  const goToPly = useCallback(
    (target: number) => {
      if (!id) return;
      const clamped = Math.max(0, Math.min(totalPlies, target));
      if (clamped === totalPlies) navigate(`/games/${id}`);
      else navigate(`/games/${id}/${clamped}`);
    },
    [id, totalPlies, navigate],
  );

  const goPrev = useCallback(() => {
    if (currentPly > 0) goToPly(currentPly - 1);
  }, [currentPly, goToPly]);

  const goNext = useCallback(() => {
    if (currentPly < totalPlies) goToPly(currentPly + 1);
  }, [currentPly, totalPlies, goToPly]);

  useEffect(() => {
    const el = currentMoveRef.current;
    if (!el) return;
    // Manually scroll *only* the inner <ol> — never the page. scrollIntoView
    // (even with block: "nearest") cascades through scrollable ancestors and
    // can shift the document, hiding the board. We compute the target
    // scrollTop ourselves and clamp it to the list's bounds, so a centered
    // row stays centered when there's room and clamps near start/end.
    const ol = el.closest(`.${styles.moves}`) as HTMLElement | null;
    if (!ol) return;
    const elTop = el.offsetTop;
    const elHeight = el.offsetHeight;
    const olHeight = ol.clientHeight;
    const ideal = elTop - (olHeight - elHeight) / 2;
    const maxScroll = ol.scrollHeight - olHeight;
    const target = Math.max(0, Math.min(maxScroll, ideal));
    ol.scrollTo({ top: target, behavior: "smooth" });
  }, [currentPly, totalPlies]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const displayFen = useMemo(() => {
    if (currentPly === 0) return STARTING_FEN;
    if (isLatest && data?.game.fen) return data.game.fen;
    const move = moves.find((m) => m.ply === currentPly);
    return move?.fen_after ?? data?.game.fen ?? STARTING_FEN;
  }, [currentPly, isLatest, moves, data?.game.fen]);

  const groupedIllegal = useMemo(() => {
    const map = new Map<number, MoveRow[]>();
    if (!data) return map;
    for (const a of data.illegalAttempts) {
      const arr = map.get(a.ply) ?? [];
      arr.push(a);
      map.set(a.ply, arr);
    }
    return map;
  }, [data]);

  // Replay legal moves with chess.js to recover the from/to squares of each
  // ply (chess.js' Move object exposes them; the SAN alone doesn't). Castling
  // moves contribute the rook's squares too so both pieces highlight.
  const moveSquares = useMemo(() => {
    const map = new Map<number, string[]>();
    const chess = new Chess();
    for (const m of moves) {
      try {
        const result = chess.move(m.san);
        if (!result) continue;
        const squares: string[] = [result.from, result.to];
        const flags = result.flags ?? "";
        if (flags.includes("k") || flags.includes("q")) {
          const rank = result.color === "w" ? "1" : "8";
          if (flags.includes("k")) squares.push(`h${rank}`, `f${rank}`);
          else squares.push(`a${rank}`, `d${rank}`);
        }
        map.set(m.ply, squares);
      } catch {
        // skip un-replayable move; highlight just won't appear for that ply
      }
    }
    return map;
  }, [moves]);

  const customSquareStyles = useMemo<Record<string, React.CSSProperties>>(() => {
    if (currentPly === 0) return {};
    const squares = moveSquares.get(currentPly);
    if (!squares) return {};
    const style: React.CSSProperties = {
      background: "rgba(255, 220, 90, 0.42)",
      boxShadow: "inset 0 0 0 2px rgba(255, 220, 90, 0.7)",
    };
    const out: Record<string, React.CSSProperties> = {};
    for (const sq of squares) out[sq] = style;
    return out;
  }, [currentPly, moveSquares]);

  const currentMove = useMemo(
    () => moves.find((m) => m.ply === currentPly),
    [moves, currentPly],
  );

  const play = useCallback(async () => {
    if (!id || !isLatest) return;
    setPlaying(true);
    setError(null);
    const startMoves = data?.moves.length ?? 0;
    const startStatus = data?.game.status ?? "in_progress";

    try {
      await api.play(id); // 202 — background function takes over from here
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPlaying(false);
      return;
    }

    // Poll /api/games/:id until a new move lands or the status changes (e.g.
    // game ended, abandoned). 5-minute ceiling matches the background fn's
    // worst-case retry budget.
    const startTime = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000;
    const POLL_MS = 1500;

    while (Date.now() - startTime < TIMEOUT_MS) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      try {
        const fresh = await api.getGame(id);
        setData(fresh);
        if (
          fresh.moves.length > startMoves ||
          fresh.game.status !== startStatus
        ) {
          setPlaying(false);
          return;
        }
      } catch {
        // transient — keep polling
      }
    }
    setError("Move took too long to process. Try again.");
    setPlaying(false);
  }, [id, isLatest, data]);

  // Play a sound whenever the move count increases for the active game (so
  // polling moves and refreshes both trigger it). Initial load and game
  // switches don't fire — the ref tracks the last-seen count per game id.
  useEffect(() => {
    if (!data || !id) return;
    const count = data.moves.length;
    if (lastSeenMovesRef.current.id !== id) {
      lastSeenMovesRef.current = { id, count };
      return;
    }
    if (count > lastSeenMovesRef.current.count) {
      playMoveSound();
    }
    lastSeenMovesRef.current = { id, count };
  }, [data, id]);

  if (loading) return <div className={styles.card}>Loading…</div>;
  if (!data) return <div className={styles.card}>Game not found.</div>;

  const { game } = data;
  const isOver = game.status !== "in_progress";
  const canPlay = isLatest && !isOver && !playing;

  return (
    <div className={styles.gameView}>
      <div className={`${styles.card} ${styles.boardCard}`}>
        <h2 className={styles.matchup}>
          <span className={styles.sidePair}>
            <span className={`${styles.sidePill} ${SIDE_PILL.white}`} title="White">
              <span aria-hidden="true">♔</span> White
            </span>
            <ModelLabel modelId={game.white_model} models={models} size={22} />
          </span>
          <span className={styles.vs}>vs</span>
          <span className={styles.sidePair}>
            <ModelLabel modelId={game.black_model} models={models} size={22} />
            <span className={`${styles.sidePill} ${SIDE_PILL.black}`} title="Black">
              <span aria-hidden="true">♚</span> Black
            </span>
          </span>
        </h2>
        <div className={styles.statusRow}>
          <span className={`${styles.pill} ${STATUS_PILL[game.status] ?? ""}`}>
            {formatStatus(game.status)}
            {game.result_reason ? ` · ${game.result_reason}` : ""}
          </span>
          <span className={styles.pill}>
            {totalPlies} move{totalPlies === 1 ? "" : "s"} played
          </span>
        </div>

        <div className={styles.boardWrap}>
          <Chessboard
            position={displayFen}
            arePiecesDraggable={false}
            customSquareStyles={customSquareStyles}
          />
          {playing && (
            <div
              className={styles.thinkingOverlay}
              role="status"
              aria-live="polite"
              aria-label="Thinking"
            >
              {nextModel && (
                <div className={styles.thinkingActor}>
                  <span
                    className={`${styles.sidePill} ${SIDE_PILL[nextSide]}`}
                    aria-hidden="true"
                  >
                    <span aria-hidden="true">
                      {nextSide === "white" ? "♔" : "♚"}
                    </span>{" "}
                    {nextSide === "white" ? "White" : "Black"}
                  </span>
                  <ModelLabel modelId={nextModel} models={models} size={18} />
                </div>
              )}
              <div className={styles.thinkingPieces} aria-hidden="true">
                <span className={`${styles.thinkingPiece} ${styles.tp1}`}>♞</span>
                <span className={`${styles.thinkingPiece} ${styles.tp2}`}>♝</span>
                <span className={`${styles.thinkingPiece} ${styles.tp3}`}>♜</span>
                <span className={`${styles.thinkingPiece} ${styles.tp4}`}>♛</span>
              </div>
              <div className={styles.thinkingLabel} key={thinkingPhrase}>
                {thinkingPhrase}
              </div>
            </div>
          )}
        </div>

        <div className={styles.navRow} aria-label="Move navigation">
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => goToPly(0)}
            disabled={currentPly === 0}
            title="Jump to start"
          >
            ⏮
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goPrev}
            disabled={currentPly === 0}
            title="Previous move (←)"
          >
            ◀
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goNext}
            disabled={currentPly === totalPlies}
            title="Next move (→)"
          >
            ▶
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => goToPly(totalPlies)}
            disabled={isLatest}
            title="Jump to latest"
          >
            ⏭
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.playRow}>
          {isLatest ? (
            <button
              className={styles.primary}
              onClick={play}
              disabled={!canPlay}
              title={isOver ? "Game is over" : undefined}
            >
              {playing
                ? "Thinking…"
                : `Ask ${
                    models.find((m) => m.id === nextModel)?.label ??
                    nextModel ??
                    "AI"
                  } for a move`}
            </button>
          ) : (
            <span className={styles.observingLabel}>
              <span className={styles.observingTag}>Observing</span>
              {currentMove && (
                <>
                  <span className={styles.observingDivider} aria-hidden="true">
                    —
                  </span>
                  <span
                    className={`${styles.pieceIcon} ${PIECE_ICON_SIDE[currentMove.side as "white" | "black"]}`}
                    aria-hidden="true"
                  >
                    {PIECE_GLYPH[pieceFromSan(currentMove.san)]}
                  </span>
                  <span className={styles.observingMove}>{currentMove.san}</span>
                  <span className={styles.observingBy}>by</span>
                  <ModelLabel
                    modelId={currentMove.model}
                    models={models}
                    size={14}
                  />
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <div className={`${styles.card} ${styles.historyCard}`}>
        <h3>Move history</h3>
        {moves.length === 0 && <p className={styles.muted}>No moves yet.</p>}
        <ol className={styles.moves}>
          {moves.map((m) => {
            const illegalForThisPly = groupedIllegal.get(m.ply) ?? [];
            const isCurrent = m.ply === currentPly;
            const piece = pieceFromSan(m.san);
            return (
              <li
                key={m.id}
                ref={isCurrent ? currentMoveRef : null}
                className={`${styles.move}${isCurrent ? ` ${styles.current}` : ""}`}
              >
                <button
                  type="button"
                  className={styles.moveLink}
                  onClick={() => goToPly(m.ply)}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  <div className={styles.moveHead}>
                    <span className={styles.plyNum}>{m.ply}.</span>
                    <span
                      className={`${styles.pieceIcon} ${PIECE_ICON_SIDE[m.side as "white" | "black"]}`}
                      title={`${m.side === "white" ? "White" : "Black"} ${PIECE_LABEL[piece]}`}
                      aria-label={`${m.side} ${PIECE_LABEL[piece].toLowerCase()}`}
                    >
                      {PIECE_GLYPH[piece]}
                    </span>
                    <span className={styles.san}>{m.san}</span>
                    <ModelLabel
                      modelId={m.model}
                      models={models}
                      size={14}
                      className={styles.moveLabel}
                    />
                    {illegalForThisPly.length > 0 && (
                      <span className={`${styles.pill} ${styles.illegal}`}>
                        {illegalForThisPly.length} rejected
                      </span>
                    )}
                  </div>
                  {m.explanation && (
                    <div className={styles.explanation}>{m.explanation}</div>
                  )}
                </button>
                {illegalForThisPly.length > 0 && (
                  <details className={styles.illegalDetails}>
                    <summary>Show rejected attempts</summary>
                    <ul>
                      {illegalForThisPly.map((a) => (
                        <li key={a.id}>
                          <code>{a.proposed_move || "(empty)"}</code> —{" "}
                          <span className={styles.muted}>
                            {a.illegality_reason ?? "rejected"}
                          </span>
                          {a.explanation && (
                            <div className={`${styles.explanation} ${styles.small}`}>
                              {a.explanation}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`${styles.card} ${styles.promptsCard}`}>
        <h3>Game settings</h3>
        <div className={styles.settingsGrid}>
          <section className={styles.settingsSide}>
            <header className={styles.settingsSideHeader}>
              <span className={`${styles.sidePill} ${SIDE_PILL.white}`}>
                <span aria-hidden="true">♔</span> White
              </span>
              <ModelLabel
                modelId={game.white_model}
                models={models}
                size={18}
              />
            </header>
            <div className={styles.settingsPromptLabel}>System prompt</div>
            <p className={styles.settingsPromptText}>{game.white_prompt}</p>
          </section>
          <section className={styles.settingsSide}>
            <header className={styles.settingsSideHeader}>
              <span className={`${styles.sidePill} ${SIDE_PILL.black}`}>
                <span aria-hidden="true">♚</span> Black
              </span>
              <ModelLabel
                modelId={game.black_model}
                models={models}
                size={18}
              />
            </header>
            <div className={styles.settingsPromptLabel}>System prompt</div>
            <p className={styles.settingsPromptText}>{game.black_prompt}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
