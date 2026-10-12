import { useEffect, useRef, useState } from "react";
import type { ModelEntry } from "../lib/api.js";
import { ProviderLogo } from "./ProviderLogo.js";
import styles from "./ModelSelect.module.css";

interface Props {
  models: ModelEntry[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export const ModelSelect = ({ models, value, onChange, ariaLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = models.find((m) => m.id === value);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && !wrapperRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Scroll the selected option into view whenever the menu opens.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const target = list.querySelector(
      '[aria-selected="true"]',
    ) as HTMLElement | null;
    target?.scrollIntoView({ block: "nearest" });
  }, [open]);

  return (
    <div className={styles.modelSelect} ref={wrapperRef}>
      <button
        type="button"
        className={styles.modelSelectTrigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {selected ? (
          <>
            <ProviderLogo provider={selected.provider} size={20} />
            <span className={styles.modelSelectLabel}>{selected.label}</span>
          </>
        ) : (
          <span className={styles.muted}>Select a model…</span>
        )}
        <span className={styles.modelSelectCaret} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul className={styles.modelSelectOptions} role="listbox" ref={listRef}>
          {models.map((m) => {
            const isSelected = m.id === value;
            return (
              <li
                key={m.id}
                role="option"
                aria-selected={isSelected}
                className={`${styles.modelSelectOption}${isSelected ? ` ${styles.selected}` : ""}`}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
              >
                <ProviderLogo provider={m.provider} size={20} />
                <span className={styles.modelSelectLabel}>{m.label}</span>
                {isSelected && (
                  <span className={styles.modelSelectCheck} aria-hidden="true">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
