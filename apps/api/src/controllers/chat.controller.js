const { toolRouter } = require("../services/gemini/toolRouter");
const { safeJson } = require("../utils/safeJson");

exports.chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    const result = await toolRouter({
      userMessage: message,
      context: context || {},
    });

    res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
