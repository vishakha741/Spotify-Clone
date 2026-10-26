module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (!error) return next();
  const msg = error.details[0].message.replace(/"/g, "");
  return res.status(400).json({ success: false, message: msg });
};