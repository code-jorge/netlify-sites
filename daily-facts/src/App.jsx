import { useEffect, useState } from "react";
import styles from "./App.module.css";

const App = () => {
  const [fact, setFact] = useState(null);
  const [factError, setFactError] = useState(null);
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    fetch("/api/historical-fact")
      .then((res) => {
        if (!res.ok) throw new Error("Function returned " + res.status);
        return res.json();
      })
      .then((data) => setFact(data.fact))
      .catch((err) => setFactError(err.message));

    fetch("/api/track-visit-background");

    fetch("/api/get-visits")
      .then((res) => res.json())
      .then((data) => setVisits(data.visits))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus(null);
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "subscribe",
          email,
        }).toString(),
      });
      if (!res.ok) throw new Error("Submission failed");
      setFormStatus("success");
      setEmail("");
    } catch {
      setFormStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* Netlify Image CDN */}
      <div>
        <img
          className={styles.logo}
          src="/.netlify/images?url=/logo.png&w=300&q=80"
          alt="Logo"
          width={150}
          height={150}
        />
      </div>

      <h1 className={styles.title}>Fun facts about today in history</h1>
      {visits !== null && (
        <p className={styles.visits}>{visits} {visits === 1 ? "visit" : "visits"} today</p>
      )}

      {/* AI-powered historical fact */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Did you know?</p>
        <p className={styles.fact}>
          {factError
            ? `Error: ${factError}`
            : fact ?? "Loading historical fact\u2026"}
        </p>
      </div>

      {/* Netlify Forms */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Subscribe for more</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "Sending\u2026" : "Subscribe"}
          </button>
        </form>
        {formStatus === "success" && (
          <p className={styles.success}>Thanks for subscribing!</p>
        )}
        {formStatus === "error" && (
          <p className={styles.error}>Something went wrong. Try again.</p>
        )}
      </div>
    </div>
  );
}

export default App;