import Anthropic from "@anthropic-ai/sdk";
import { getStore } from "@netlify/blobs";

export default async () => {
  const client = new Anthropic();
  const store = getStore("quotes");

  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "long" });
  const day = today.getDate();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Tell me one short, interesting historical fact about something that happened on ${month} ${day}. Reply with just the fact in 1-2 sentences, no preamble.`,
      },
    ],
  });

  const fact = message.content[0].text;

  // Append to the blob for today's date
  const existing = await store.get(key, { type: "json" }).catch(() => null);
  const facts = existing ?? [];
  facts.push(fact);
  await store.setJSON(key, facts);

  return Response.json({ fact });
};

export const config = {
  path: "/api/historical-fact",
};
