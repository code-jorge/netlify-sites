import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type GameSummary, type ModelEntry } from "../lib/api.js";
import { ModelLabel } from "./ModelLabel.js";
import { formatStatus } from "../lib/status.js";
import { formatDateLong } from "../lib/format.js";
import { DeleteGameDialog } from "./DeleteGameDialog.js";
import styles from "./GameList.module.css";

interface Props {
  models: ModelEntry[];
}

const STATUS_PILL: Record<string, string> = {
  in_progress: styles.statusInProgress,
  white_won: styles.statusWhiteWon,
  black_won: styles.statusBlackWon,
  draw: styles.statusDraw,
  abandoned: styles.statusAbandoned,
};

export const GameList = ({ models }: Props) => {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GameSummary | null>(null);

  const refresh = async () => {
    try {
      const res = await api.listGames();
      setGames(res.games);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, []);

  // Close the per-row menu when clicking anywhere outside it.
  useEffect(() => {
    if (!openMenuId) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(`.${styles.gameActions}`)) setOpenMenuId(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openMenuId]);

  return (
    <div className={styles.card}>
      <h2>Past games</h2>
      {error && <div className={styles.error}>{error}</div>}
      {loading && <p className={styles.muted}>Loading…</p>}
      {!loading && games.length === 0 && (
        <p className={styles.muted}>No games yet — set one up above.</p>
      )}
      <ul className={styles.gameList}>
        {games.map((g) => (
          <li key={g.id} className={styles.gameListItem}>
            <Link to={`/games/${g.id}`} className={styles.linkBlock}>
              <div className={styles.row}>
                <span className={styles.matchup}>
                  <ModelLabel modelId={g.white_model} models={models} size={16} />
                  <span className={styles.vs}>vs</span>
                  <ModelLabel modelId={g.black_model} models={models} size={16} />
                </span>
                <span className={`${styles.pill} ${STATUS_PILL[g.status] ?? ""}`}>
                  {formatStatus(g.status)}
                </span>
              </div>
              <div className={`${styles.muted} ${styles.small}`}>
                {formatDateLong(g.created_at)} · {g.move_count} move
                {Number(g.move_count) === 1 ? "" : "s"}
                {g.result_reason ? ` · ${g.result_reason}` : ""}
              </div>
            </Link>
            <div className={styles.gameActions}>
              <button
                type="button"
                className={styles.menuBtn}
                aria-label="Game settings"
                aria-haspopup="menu"
                aria-expanded={openMenuId === g.id}
                onClick={() =>
                  setOpenMenuId(openMenuId === g.id ? null : g.id)
                }
              >
                ⋯
              </button>
              {openMenuId === g.id && (
                <div className={styles.menu} role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.menuItem} ${styles.danger}`}
                    onClick={() => {
                      setDeleteTarget(g);
                      setOpenMenuId(null);
                    }}
                  >
                    Delete game
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {deleteTarget && (
        <DeleteGameDialog
          game={deleteTarget}
          models={models}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await api.deleteGame(deleteTarget.id);
            setDeleteTarget(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
};
