const Joi = require("joi");

exports.songSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  artist: Joi.string().min(1).max(100).required(),
  src: Joi.string().required(),
  cover: Joi.string().allow(""),
  mood: Joi.string().valid("happy", "sad", "chill", "focus", "party"),
});