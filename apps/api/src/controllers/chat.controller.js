const { toolRouter } = require("../services/gemini/toolRouter");
const { nowContext } = require("../utils/dateRange");

exports.chat = async (req, res, next) => {
  try {
    const { message, context, history } = req.body;

    const result = await toolRouter({
      userMessage: message,
      context: context || {},
      history: history || [],
      now: nowContext(),
    });

    res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
