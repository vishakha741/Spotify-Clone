const mongoose = require("mongoose");

const playLogSchema = new mongoose.Schema({
  listenerId: { type: String, required: true, index: true },
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
  title: String,
  artist: String,
  seconds: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PlayLog", playLogSchema);