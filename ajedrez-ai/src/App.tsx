import { useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "./components/HomePage.js";
import { GameList } from "./components/GameList.js";
import { GameView } from "./components/GameView.js";
import { api, type ModelEntry } from "./lib/api.js";
import styles from "./App.module.css";

export const App = () => {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .models()
      .then((res) => {
        setModels(res.models);
        setDefaultPrompt(res.defaultPrompt);
      })
      .catch((e) => setError(e.message));
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink}${isActive ? ` ${styles.active}` : ""}`;

  return (
    <BrowserRouter>
      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
          <Link to="/" className={styles.brand}>
            <img
              src="/favicon.png"
              alt=""
              aria-hidden="true"
              className={styles.brandLogo}
            />
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>Chess Bot Wars</span>
              <span className={styles.brandTagline}>
                Pit two LLMs against each other on a chessboard.
              </span>
            </span>
          </Link>
          <nav className={styles.siteNav} aria-label="Primary">
            <NavLink to="/" end className={navLinkClass}>
              New game
            </NavLink>
            <NavLink to="/games" className={navLinkClass}>
              Past games
            </NavLink>
          </nav>
        </div>
      </header>

      <div className={styles.app}>
        {error && <div className={`${styles.card} ${styles.error}`}>{error}</div>}

        <Routes>
          <Route
            path="/"
            element={
              <HomePage models={models} defaultPrompt={defaultPrompt} />
            }
          />
          <Route path="/games" element={<GameList models={models} />} />
          <Route path="/games/:id" element={<GameView models={models} />} />
          <Route
            path="/games/:id/:ply"
            element={<GameView models={models} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
