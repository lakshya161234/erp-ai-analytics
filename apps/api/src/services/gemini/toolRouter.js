const { getGeminiModel } = require("./geminiClient");
const { ANALYTICS_SYSTEM_PROMPT, ASSISTANT_SYSTEM_PROMPT, buildRouterPrompt } = require("./promptTemplates");
const { toolsRegistry } = require("../db/tools/toolsRegistry");
const { executeTool } = require("../db/tools/toolsExecutor");
const { safeJsonParse } = require("../../utils/safeJson");

/**
 * Orchestrator:
 * 1) Ask Gemini to select a tool + args (strict JSON)
 * 2) Execute tool against Postgres
 * 3) Ask Gemini to summarize using the tool result only
 */
async function toolRouter({ userMessage, context, history = [], now }) {
  const model = getGeminiModel();
  const tools = toolsRegistry.list();

  // Step 1: tool selection
  const routerPrompt = buildRouterPrompt(tools, now);
  const routeResp = await model.generateContent([
    { text: routerPrompt },
    ...(history.length
      ? [{ text: `Conversation so far (most recent last): ${JSON.stringify(history.slice(-10))}` }]
      : []),
    { text: `User question: ${userMessage}` },
  ]);

  const routeText = routeResp.response.text();
  const routeJson = safeJsonParse(routeText);

  // If the model selected no tool, treat it as a general assistant request (email, reminders, etc.)
  if (!routeJson || !routeJson.tool) {
    const directResp = await model.generateContent([
      { text: ASSISTANT_SYSTEM_PROMPT },
      { text: `Time context: ${JSON.stringify(now || {})}` },
      ...(history.length
        ? [{ text: `Conversation so far (most recent last): ${JSON.stringify(history.slice(-10))}` }]
        : []),
      { text: `User request: ${userMessage}` },
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
  const finalResp = await model.generateContent([
    { text: ANALYTICS_SYSTEM_PROMPT },
    { text: `Time context: ${JSON.stringify(now || {})}` },
    { text: `User question: ${userMessage}` },
    { text: `Tool used: ${routeJson.tool}` },
    { text: `Tool args: ${JSON.stringify(routeJson.args || {})}` },
    { text: `Tool result JSON: ${JSON.stringify(toolResult)}` },
  ]);

  const finalText = finalResp.response.text();
  const finalJson = safeJsonParse(finalText);

  // If the model didn't return JSON, fall back gracefully.
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
