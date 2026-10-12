import { useEffect, useRef, useState } from "react";
import type { GameSummary, ModelEntry } from "../lib/api.js";
import { ModelLabel } from "./ModelLabel.js";
import { formatStatus } from "../lib/status.js";
import styles from "./DeleteGameDialog.module.css";

interface Props {
  game: GameSummary;
  models: ModelEntry[];
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteGameDialog = ({ game, models, onCancel, onConfirm }: Props) => {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirming) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, confirming]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConfirming(false);
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={() => !confirming && onCancel()}
      role="presentation"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-game-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="delete-game-title">Delete this game?</h3>
        <p className={`${styles.muted} ${styles.small}`}>
          This also removes every move attempt logged for the game. This action
          cannot be undone.
        </p>
        <dl className={styles.modalDetails}>
          <dt>White</dt>
          <dd>
            <ModelLabel modelId={game.white_model} models={models} size={16} />
          </dd>
          <dt>Black</dt>
          <dd>
            <ModelLabel modelId={game.black_model} models={models} size={16} />
          </dd>
          <dt>Created</dt>
          <dd>{new Date(game.created_at).toLocaleString()}</dd>
          <dt>Status</dt>
          <dd>
            {formatStatus(game.status)}
            {game.result_reason ? ` · ${game.result_reason}` : ""}
          </dd>
        </dl>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.modalActions}>
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={confirming}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.danger}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? "Deleting…" : "Delete game"}
          </button>
        </div>
      </div>
    </div>
  );
};
