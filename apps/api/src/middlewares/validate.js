const { z } = require("zod");

const chatSchema = z.object({
  message: z.string().min(1, "message is required"),
  context: z.record(z.any()).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string(),
        ts: z.string().optional(),
      })
    )
    .max(30)
    .optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: "Validation error",
        details: parsed.error.flatten(),
      });
    }
    req.body = parsed.data;
    next();
  };
}

module.exports = { validate, chatSchema };
