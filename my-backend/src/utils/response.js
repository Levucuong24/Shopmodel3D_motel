export const success = (res, data) => res.json({ success: true, data });
export const error = (res, msg) => res.status(400).json({ success: false, msg });