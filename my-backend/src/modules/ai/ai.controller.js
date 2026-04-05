import { generate3D } from "./ai.service.js";

export const generate = async (req, res) => {
  const result = await generate3D(req.body.prompt);
  res.json(result);
};