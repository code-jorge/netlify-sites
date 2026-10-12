import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { findModel, type Provider } from "./models.js";

export interface MoveProposal {
  move: string;
  explanation: string;
  raw: string;
}

export interface ChessContext {
  fen: string;
  side: "white" | "black";
  legalMoves: string[];
  history: string[];
  previousIllegalAttempts: { move: string; reason: string }[];
}

function buildUserMessage(ctx: ChessContext): string {
  const lines = [
    `You are playing as: ${ctx.side.toUpperCase()}`,
    `Current FEN: ${ctx.fen}`,
    `Move history (SAN): ${ctx.history.length ? ctx.history.join(" ") : "(none — opening move)"}`,
    `Legal moves available right now (SAN): ${ctx.legalMoves.join(", ")}`,
  ];
  if (ctx.previousIllegalAttempts.length) {
    lines.push("");
    lines.push(
      "Your previous attempts for THIS ply that were rejected as illegal:",
    );
    for (const a of ctx.previousIllegalAttempts) {
      lines.push(`  - "${a.move}" — ${a.reason}`);
    }
    lines.push(
      "Pick a different move that appears verbatim in the legal moves list.",
    );
  }
  lines.push("");
  lines.push(
    `Respond with a single-line JSON object: {"move": "<SAN from legal moves>", "explanation": "<reason>"}`,
  );
  return lines.join("\n");
}

function extractJson(raw: string): { move: string; explanation: string } {
  const trimmed = raw.trim();
  // Strip ```json fences if a model still wraps despite instructions.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`No JSON object found in model response: ${raw.slice(0, 200)}`);
  }
  const slice = candidate.slice(start, end + 1);
  const parsed = JSON.parse(slice);
  if (typeof parsed.move !== "string") {
    throw new Error(`Model JSON missing string "move": ${slice.slice(0, 200)}`);
  }
  return {
    move: parsed.move.trim(),
    explanation:
      typeof parsed.explanation === "string" ? parsed.explanation : "",
  };
}

async function callAnthropic(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const client = new Anthropic();
  const res = await client.messages.create({
    model: modelId,
    // Claude 5.5-generation models always think, and thinking tokens count
    // against max_tokens, so leave plenty of headroom for the JSON reply.
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic response had no text block");
  }
  return textBlock.text;
}

async function callOpenAI(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const client = new OpenAI();
  const res = await client.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });
  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI response had empty content");
  return text;
}

async function callGoogle(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const client = new GoogleGenAI({});
  const res = await client.models.generateContent({
    model: modelId,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });
  const text = res.text;
  if (!text) throw new Error("Gemini response had empty text");
  return text;
}

const dispatch: Record<
  Provider,
  (modelId: string, system: string, user: string) => Promise<string>
> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
};

export async function proposeMove(
  modelId: string,
  systemPrompt: string,
  ctx: ChessContext,
): Promise<MoveProposal> {
  const model = findModel(modelId);
  if (!model) throw new Error(`Unknown model id: ${modelId}`);
  const userMessage = buildUserMessage(ctx);
  const raw = await dispatch[model.provider](modelId, systemPrompt, userMessage);
  const parsed = extractJson(raw);
  return { move: parsed.move, explanation: parsed.explanation, raw };
}
