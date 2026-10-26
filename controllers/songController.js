const mongoose = require("mongoose");
const Song = require("../models/Song");
const User = require("../models/User");
const Playlist = require("../models/Playlist");
const ExpressError = require("../utils/ExpressError");
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Home + search
exports.home = async (req, res,next) => {
  try {
    const q = (req.query.q || "").trim();
    let filter = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter = { $or: [{ title: rx }, { artist: rx }, { mood: rx }] };
    }
    const songs = await Song.find(filter);
    const user = res.locals.currentUser;
    const likedIds = user ? user.likedSongs.map(String) : [];
    const playlists = user ? await Playlist.find({ owner: user._id }).select("name") : [];
    res.render("index", { songs, q, likedIds, playlists });
  } catch (err) {
    
    next(err);
  }
};

// Liked songs page
exports.likedPage = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate("likedSongs");
    const songs = user.likedSongs;
    const playlists = await Playlist.find({ owner: user._id }).select("name");
    res.render("liked", { songs, likedIds: songs.map((s) => String(s._id)), playlists });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

// Like / Unlike toggle (JSON API)
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid song" });
    const song = await Song.findById(id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    const user = await User.findById(req.session.userId);
    const already = user.likedSongs.some((s) => String(s) === id);
    if (already) user.likedSongs.pull(id);
    else user.likedSongs.push(id);
    await user.save();
    res.json({ liked: !already });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};