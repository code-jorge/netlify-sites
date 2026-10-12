import { useNavigate } from "react-router-dom";
import { GameSetup } from "./GameSetup.js";
import type { ModelEntry } from "../lib/api.js";

interface Props {
  models: ModelEntry[];
  defaultPrompt: string;
}

export const HomePage = ({ models, defaultPrompt }: Props) => {
  const navigate = useNavigate();
  return (
    <GameSetup
      models={models}
      defaultPrompt={defaultPrompt}
      onCreated={(id) => navigate(`/games/${id}`)}
    />
  );
}
