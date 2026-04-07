export default (err, req, res, next) => {
  console.error("ERROR MIDDLEWARE:", err);
  res.status(500).json({ message: err.message });
};