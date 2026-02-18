export default async (req) => {
  const url = new URL(req.url);
  const baseUrl = url.origin;
  const results = {};

  // 1. Page loads ok
  const pageRes = await fetch(baseUrl);
  results.page = pageRes.ok ? 'ok' : 'error';

  // 2. Edge function injects meta description
  const html = await pageRes.text();
  const hasMeta = html.includes('<meta name="description"');
  results.edgeFunction = hasMeta ? 'ok' : 'error';

  // 3. Image CDN serves the logo
  const logoRes = await fetch(`${baseUrl}/.netlify/images?url=/logo.png&w=300&q=80`);
  results.logo = logoRes.ok ? 'ok' : 'error';

  // 4. Serverless function returns a historical fact
  const factRes = await fetch(`${baseUrl}/api/historical-fact`);
  results.function = factRes.ok ? 'ok' : 'error';

  // 5. Submit the form
  const formRes = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      "form-name": "subscribe",
      email: "subscriber@netlify.com",
    }).toString(),
  });
  results.formSubmission = formRes.ok ? 'ok' : 'error';

  // All done!
  return Response.json(results, { status: 200 });
};

export const config = {
  path: "/api/verify",
};
