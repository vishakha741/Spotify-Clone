const Joi = require("joi");

exports.playlistSchema = Joi.object({
  name: Joi.string().min(1).max(60).required(),
}).unknown(true);