export type PieceCode = "K" | "Q" | "R" | "B" | "N" | "P";

export const PIECE_GLYPH: Record<PieceCode, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
};

export const PIECE_LABEL: Record<PieceCode, string> = {
  K: "King",
  Q: "Queen",
  R: "Rook",
  B: "Bishop",
  N: "Knight",
  P: "Pawn",
};

// Extracts the moved piece from a SAN string. Castling counts as a king move.
export const pieceFromSan = (san: string): PieceCode => {
  if (san.startsWith("O-O")) return "K";
  const c = san[0];
  if (c === "K" || c === "Q" || c === "R" || c === "B" || c === "N") return c;
  return "P";
}
