import { useEffect, useRef, useState } from "react";
import { api, type ModelEntry } from "../lib/api.js";
import { ModelSelect } from "./ModelSelect.js";
import styles from "./GameSetup.module.css";

interface Props {
  models: ModelEntry[];
  defaultPrompt: string;
  onCreated: (gameId: string) => void;
}

export const GameSetup = ({ models, defaultPrompt, onCreated }: Props) => {
  const [whiteModel, setWhiteModel] = useState("");
  const [blackModel, setBlackModel] = useState("");
  const [whitePrompt, setWhitePrompt] = useState("");
  const [blackPrompt, setBlackPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const whiteRef = useRef<HTMLTextAreaElement>(null);
  const blackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!whiteModel && models[0]) setWhiteModel(models[0].id);
    if (!blackModel) setBlackModel(models[1]?.id ?? models[0]?.id ?? "");
  }, [models, whiteModel, blackModel]);

  useEffect(() => {
    if (defaultPrompt && !whitePrompt) setWhitePrompt(defaultPrompt);
    if (defaultPrompt && !blackPrompt) setBlackPrompt(defaultPrompt);
  }, [defaultPrompt, whitePrompt, blackPrompt]);

  // Mirror manual resize between the two prompt textareas. ResizeObserver
  // fires on either, and we copy the height across when it differs by more
  // than a pixel (the >1 guard avoids a feedback loop).
  useEffect(() => {
    const a = whiteRef.current;
    const b = blackRef.current;
    if (!a || !b) return;

    const sync = (from: HTMLTextAreaElement, to: HTMLTextAreaElement) => {
      const fromH = from.clientHeight;
      if (Math.abs(to.clientHeight - fromH) > 1) {
        to.style.height = `${fromH}px`;
      }
    };

    const obsA = new ResizeObserver(() => sync(a, b));
    const obsB = new ResizeObserver(() => sync(b, a));
    obsA.observe(a);
    obsB.observe(b);
    return () => {
      obsA.disconnect();
      obsB.disconnect();
    };
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await api.createGame({
        whiteModel,
        blackModel,
        whitePrompt,
        blackPrompt,
      });
      onCreated(res.game.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2>New game</h2>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.grid2}>
        <div>
          <label>White</label>
          <ModelSelect
            models={models}
            value={whiteModel}
            onChange={setWhiteModel}
            ariaLabel="White model"
          />
          <label>White system prompt</label>
          <textarea
            ref={whiteRef}
            className={styles.promptTextarea}
            rows={10}
            value={whitePrompt}
            onChange={(e) => setWhitePrompt(e.target.value)}
            placeholder={defaultPrompt}
          />
        </div>
        <div>
          <label>Black</label>
          <ModelSelect
            models={models}
            value={blackModel}
            onChange={setBlackModel}
            ariaLabel="Black model"
          />
          <label>Black system prompt</label>
          <textarea
            ref={blackRef}
            className={styles.promptTextarea}
            rows={10}
            value={blackPrompt}
            onChange={(e) => setBlackPrompt(e.target.value)}
            placeholder={defaultPrompt}
          />
        </div>
      </div>
      <button
        className={styles.primary}
        onClick={handleCreate}
        disabled={creating || !whiteModel || !blackModel}
      >
        {creating ? "Creating…" : "Start game"}
      </button>
    </div>
  );
};
