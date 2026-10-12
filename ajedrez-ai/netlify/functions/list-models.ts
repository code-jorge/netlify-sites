import { DEFAULT_PROMPT, MODELS } from "./lib/models.js";

export default async () => {
  return Response.json({ defaultPrompt: DEFAULT_PROMPT, models: MODELS });
};

export const config = {
  path: "/api/models",
  method: "GET",
};
