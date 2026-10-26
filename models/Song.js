const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    image: { type: String, default: "/assets/card1img.jpeg" },
    audioUrl: { type: String, required: true },
    mood: { type: String, default: "chill" },
    duration: { type: Number, default: 180 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);