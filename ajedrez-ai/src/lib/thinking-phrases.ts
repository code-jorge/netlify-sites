import { useEffect, useState } from "react";

export const THINKING_PHRASES = [
  "Moving knights around…",
  "Considering en passant…",
  "What if I underpromote?",
  "Counting tempo…",
  "Calculating that fork…",
  "Probing the kingside…",
  "Looking for a discovered check…",
  "Eyeing the bishop pair…",
  "Defending the back rank…",
  "Tracing diagonals…",
  "Sacrificing for initiative…",
  "Doubling rooks on the file…",
  "Plotting zugzwang…",
  "Re-routing the queen…",
  "Examining f7 closely…",
  "Weighing pawn breaks…",
  "Hunting for skewers…",
  "Maybe just a quiet move…",
  "Pretending I'm a grandmaster…",
  "What about that knight outpost?",
  "Lifting the rook…",
  "Trade pieces or keep tension?",
  "Counting passed pawns…",
  "Setting up a fianchetto…",
  "Avoiding the poisoned pawn…",
  "Studying the pawn chain…",
];

/**
 * While `active` is true, returns a chess-flavored phrase that rotates every
 * `intervalMs` (default 2.4s). Successive picks never repeat the same phrase.
 */
export const useThinkingPhrase = (active: boolean, intervalMs = 2400): string => {
  const [phrase, setPhrase] = useState(THINKING_PHRASES[0]);

  useEffect(() => {
    if (!active) return;
    let lastIdx = -1;
    const pick = () => {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * THINKING_PHRASES.length);
      } while (idx === lastIdx && THINKING_PHRASES.length > 1);
      lastIdx = idx;
      return THINKING_PHRASES[idx];
    };
    setPhrase(pick());
    const t = setInterval(() => setPhrase(pick()), intervalMs);
    return () => clearInterval(t);
  }, [active, intervalMs]);

  return phrase;
}
