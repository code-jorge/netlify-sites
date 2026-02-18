const getDescription = (date = new Date()) => {
  const formatted = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return `<meta name="description" content="Relevant fact that happened on ${formatted}">`;
}

export default async (_request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  const meta = getDescription();
  const html = await response.text();
  const updatedHtml = html.replace("</title>", `</title>\n    ${meta}`);
  return new Response(updatedHtml, response);
};
