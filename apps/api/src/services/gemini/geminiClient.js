const { GoogleGenerativeAI } = require("@google/generative-ai");

// Simple in-process concurrency limit to prevent bursts
let active = 0;
const MAX_CONCURRENT = Number(process.env.GEMINI_MAX_CONCURRENT || 1);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withBackoff(fn, retries = 3) {
  let delay = 700;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      const msg = String(e?.message || e);
      const is429 = msg.includes("429") || msg.includes("Too Many Requests");
      if (!is429 || i === retries) throw e;
      await sleep(delay);
      delay *= 2;
    }
  }
}

async function generateContentSafe(model, parts) {
  // crude queue
  while (active >= MAX_CONCURRENT) {
    await sleep(50);
  }
  active++;
  try {
    const resp = await withBackoff(() => model.generateContent(parts));
    return resp;
  } finally {
    active--;
  }
}

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

module.exports = { getGeminiModel, generateContentSafe };
