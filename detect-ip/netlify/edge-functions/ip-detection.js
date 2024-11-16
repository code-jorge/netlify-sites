export default async function handler(_request, context) {
  const response = await context.next();
  const headers = response.headers;
  const country = context.geo.country.code;
  const ip = context.ip;
  if (headers.get('content-type').includes('text/html')) {
    const content = await response.text();
    const updatedContent = content
      .replace('<body', `<body data-nf-geo="${country}"`)
      .replace('127.0.0.0', ip);
    return new Response(updatedContent, response);
  }

  return response;
}

export const config = {
  path: "*",
};
