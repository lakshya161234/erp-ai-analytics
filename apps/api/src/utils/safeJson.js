function safeJson(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return JSON.stringify({ error: "Could not stringify", message: String(e) });
  }
}

function safeJsonParse(text) {
  if (!text) return null;

  // Try to extract the first JSON object from a messy LLM response.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch (e) {
    return null;
  }
}

module.exports = { safeJson, safeJsonParse };
