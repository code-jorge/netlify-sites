// Documentation: https://sdk.netlify.com/docs

import type { Config, Context } from "@netlify/edge-functions";
import generateTemplate from "./template.js";

const handler = async (request: Request, context: Context) => {
  const maintenance = Netlify.env.get("MAINTENANCE_ENABLED");
  // If the env var isn't there, continue
  if (!maintenance) return await context.next();
  try {
    const { enabled, reason } = JSON.parse(maintenance);
    // If maintenance mode isn't enabled, continue
    if (!enabled) return await context.next();
    // Return the maintenance template
    return new Response(generateTemplate(reason), {
      headers: { "content-type": "text/html" },
    })
  }
  catch (error) {
    const response = await context.next();
    return response;
  }
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
