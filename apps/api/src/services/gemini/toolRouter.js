const { getGeminiModel } = require("./geminiClient");
const { SYSTEM_PROMPT, buildRouterPrompt } = require("./promptTemplates");
const { toolsRegistry } = require("../db/tools/toolsRegistry");
const { executeTool } = require("../db/tools/toolsExecutor");
const { safeJsonParse } = require("../../utils/safeJson");

/**
 * Orchestrator:
 * 1) Ask Gemini to select a tool + args (strict JSON)
 * 2) Execute tool against Postgres
 * 3) Ask Gemini to summarize using the tool result only
 */
async function toolRouter({ userMessage, context }) {
  const model = getGeminiModel();
  const tools = toolsRegistry.list();

  // Step 1: tool selection
  const routerPrompt = buildRouterPrompt(tools);
  const routeResp = await model.generateContent([
    { text: routerPrompt },
    { text: `User question: ${userMessage}` },
  ]);

  const routeText = routeResp.response.text();
  const routeJson = safeJsonParse(routeText);

  if (!routeJson || !routeJson.tool) {
    return {
      answer: "I can't answer that with the currently available analytics tools.",
      data: { supported_tools: tools.map(t => t.name) },
      toolsUsed: [],
      router: { raw: routeText, parsed: routeJson || null },
    };
  }

  // Step 2: run tool
  const toolResult = await executeTool(routeJson.tool, routeJson.args || {});

  // Step 3: final answer grounded on tool result
  const finalResp = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: `User question: ${userMessage}` },
    { text: `Tool used: ${routeJson.tool}` },
    { text: `Tool args: ${JSON.stringify(routeJson.args || {})}` },
    { text: `Tool result JSON: ${JSON.stringify(toolResult)}` },
    { text: `Return JSON with keys: answer (string), data (object).` },
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
