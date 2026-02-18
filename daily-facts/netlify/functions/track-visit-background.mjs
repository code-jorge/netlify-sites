import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("visits");

  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const current = await store.get(key, { type: "json" }).catch(() => null);
  const count = (current ?? 0) + 1;
  await store.setJSON(key, count);
};

export const config = {
  path: "/api/track-visit-background",
};
