import type { Config, Context } from "@netlify/edge-functions";
import { getStore } from '@netlify/blobs';
import generateTemplate from "./template.js";

const handler = async (request: Request, context: Context) => {
  // Get the Blob store
  const store = getStore('maintenance');
  if (!store) return await context.next();
  // If maintenance mode is not enabled return
  const status = await store.get('status');
  if (status !== 'enabled') return await context.next();
  // Get the maintenance message
  const reason = await store.get('message');
  // Return the maintenance template
  return new Response(generateTemplate(reason), {
    headers: { "content-type": "text/html" },
  })
}

export default handler;

export const config: Config = {
  method: "GET",
  path: '/*',
  excludedPath: [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ]
};
