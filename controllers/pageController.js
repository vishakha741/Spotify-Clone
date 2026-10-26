const Song = require("../models/Song");

exports.home = async (req, res) => {
  const songs = await Song.find({});
  res.render("index", { songs });
};