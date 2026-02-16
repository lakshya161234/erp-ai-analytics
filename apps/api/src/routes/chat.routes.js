const router = require("express").Router();
const { validate } = require("../middlewares/validate");
const { chatSchema } = require("../middlewares/validate");
const chatController = require("../controllers/chat.controller");

// POST /chat
// body: { message: string, context?: object }
router.post("/", validate(chatSchema), chatController.chat);

module.exports = router;
