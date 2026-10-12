import modelsData from "./models.json";

export type Provider = "anthropic" | "openai" | "google";

export interface ModelEntry {
  id: string;
  label: string;
  provider: Provider;
}

export interface ModelsFile {
  defaultPrompt: string;
  models: ModelEntry[];
}

const data = modelsData as ModelsFile;

export const DEFAULT_PROMPT = data.defaultPrompt;
export const MODELS: ModelEntry[] = data.models;

export function findModel(id: string): ModelEntry | undefined {
  return MODELS.find((m) => m.id === id);
}
