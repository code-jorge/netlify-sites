import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("visits");

  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const count = await store.get(key, { type: "json" }).catch(() => null);

  return Response.json({ visits: count ?? 0 });
};

export const config = {
  path: "/api/get-visits",
};
