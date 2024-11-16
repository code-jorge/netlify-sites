export default async function handler(_request, context) {
  const response = await context.next();
  const headers = response.headers;
  if (headers.get('content-type').includes('text/html')) {
    const content = await response.text();
    const date = Netlify.env.get("TARGET_DATE")
    const updatedContent = content.replace('const referenceDate = ""', `const referenceDate = "${date}"`)
    return new Response(updatedContent, response);
  }
  return response;
}

export const config = {
  path: "*",
};