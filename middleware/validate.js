const ExpressError = require("../utils/ExpressError");

module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressError(400, msg);
  }
  next();
};