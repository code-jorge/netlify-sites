import { ProviderLogo } from "./ProviderLogo.js";
import type { ModelEntry } from "../lib/api.js";
import styles from "./ModelLabel.module.css";

interface Props {
  modelId: string;
  models: ModelEntry[];
  size?: number;
  className?: string;
}

export const ModelLabel = ({ modelId, models, size, className }: Props) => {
  const entry = models.find((m) => m.id === modelId);
  return (
    <span className={`${styles.modelLabel}${className ? ` ${className}` : ""}`}>
      {entry && <ProviderLogo provider={entry.provider} size={size} />}
      <span>{entry?.label ?? modelId}</span>
    </span>
  );
};
