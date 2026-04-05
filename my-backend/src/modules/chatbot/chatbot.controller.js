import { chatbotReply } from "./chatbot.service.js";

export const chat = async (req, res) => {
  try {
    const data = await chatbotReply(req.body.text);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      reply: "Mình chưa thể đọc dữ liệu hệ thống lúc này. Bạn thử lại sau nhé.",
      suggestions: [],
    });
  }
};
