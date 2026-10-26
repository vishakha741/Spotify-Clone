const mongoose = require("mongoose");
const crypto = require("crypto");

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ownerId: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  shareId: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(5).toString("hex"),
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Playlist", playlistSchema);