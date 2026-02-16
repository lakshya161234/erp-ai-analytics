const { getGeminiModel, generateContentSafe } = require("./geminiClient");
const {
  ANALYTICS_SYSTEM_PROMPT,
  ASSISTANT_SYSTEM_PROMPT,
  buildRouterPrompt,
} = require("./promptTemplates");
const { toolsRegistry } = require("../db/tools/toolsRegistry");
const { executeTool } = require("../db/tools/toolsExecutor");
const { safeJsonParse } = require("../../utils/safeJson");

/**
 * Orchestrator:
 * 1) Ask Gemini to select a tool + args (strict JSON)
 * 2) Execute tool against Postgres
 * 3) Ask Gemini to summarize using the tool result only
 *
 * NOTE: This file previously caused 429 easily:
 * - 2 Gemini calls per user message
 * - large history JSON increasing token usage
 * - no backoff
 */
function compactHistory(history) {
  // keep only last 6 messages to reduce token burn
  const h = Array.isArray(history) ? history.slice(-6) : [];
  // keep only role + text (drop timestamps/extra)
  return h.map((x) => ({
    role: x.role,
    text: typeof x.text === "string" ? x.text.slice(0, 1200) : "",
  }));
}

async function toolRouter({ userMessage, context, history = [], now }) {
  const model = getGeminiModel();
  const tools = toolsRegistry.list();

  const safeHist = compactHistory(history);
  const q = typeof userMessage === "string" ? userMessage.slice(0, 2000) : "";

  // Step 1: tool selection
  const routerPrompt = buildRouterPrompt(tools, now);
  const routeResp = await generateContentSafe(model, [
    { text: routerPrompt },
    ...(safeHist.length
      ? [{ text: `Conversation so far (most recent last): ${JSON.stringify(safeHist)}` }]
      : []),
    { text: `User question: ${q}` },
  ]);

  const routeText = routeResp.response.text();
  const routeJson = safeJsonParse(routeText);

  // If the model selected no tool, treat it as a general assistant request
  if (!routeJson || !routeJson.tool) {
    const directResp = await generateContentSafe(model, [
      { text: ASSISTANT_SYSTEM_PROMPT },
      { text: `Time context: ${JSON.stringify(now || {})}` },
      ...(safeHist.length
        ? [{ text: `Conversation so far (most recent last): ${JSON.stringify(safeHist)}` }]
        : []),
      { text: `User request: ${q}` },
    ]);

    const directText = directResp.response.text();
    const directJson = safeJsonParse(directText);

    if (directJson && typeof directJson.answer === "string") {
      return {
        answer: directJson.answer,
        data: directJson.data || { type: "direct", format: "text", draft: directJson.answer },
        toolsUsed: [],
        router: { raw: routeText, parsed: routeJson || null },
      };
    }

    return {
      answer: directText.trim(),
      data: { type: "direct", format: "text", draft: directText.trim() },
      toolsUsed: [],
      router: { raw: routeText, parsed: routeJson || null },
    };
  }

  // Step 2: run tool
  const toolResult = await executeTool(routeJson.tool, routeJson.args || {}, { now });

  // Step 3: final answer grounded on tool result
  const finalResp = await generateContentSafe(model, [
    { text: ANALYTICS_SYSTEM_PROMPT },
    { text: `Time context: ${JSON.stringify(now || {})}` },
    { text: `User question: ${q}` },
    { text: `Tool used: ${routeJson.tool}` },
    { text: `Tool args: ${JSON.stringify(routeJson.args || {})}` },
    // Prevent huge payloads from burning tokens
    { text: `Tool result JSON: ${JSON.stringify(toolResult).slice(0, 12000)}` },
  ]);

  const finalText = finalResp.response.text();
  const finalJson = safeJsonParse(finalText);

  if (!finalJson || typeof finalJson.answer !== "string") {
    return {
      answer: finalText.trim(),
      data: toolResult,
      toolsUsed: [routeJson.tool],
      router: { tool: routeJson.tool, args: routeJson.args || {}, reason: routeJson.reason || "" },
    };
  }

  return {
    answer: finalJson.answer,
    data: finalJson.data ?? toolResult,
    toolsUsed: [routeJson.tool],
    router: { tool: routeJson.tool, args: routeJson.args || {}, reason: routeJson.reason || "" },
  };
}

module.exports = { toolRouter };
