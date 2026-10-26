module.exports = (schema, viewName) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (!error) return next();
  const msg = error.details[0].message.replace(/"/g, "");
  return res.status(400).render(viewName, {
    error: msg,
    form: { email: req.body.email || "", name: req.body.name || "" },
  });
};