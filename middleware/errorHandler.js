module.exports = (err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;

  // Invalid MongoDB id
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

  const wantsJson = req.originalUrl.startsWith("/api");
  if (wantsJson) return res.status(statusCode).json({ success: false, message });

  res.status(statusCode).render("error", { statusCode, message });
};