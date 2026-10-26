const mongoose = require("mongoose");
const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const User = require("../models/User");

exports.list = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    res.render("playlists", { playlists, error: null });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

exports.create = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) {
      const playlists = await Playlist.find({ owner: req.session.userId }).sort({ createdAt: -1 });
      return res.render("playlists", { playlists, error: "Playlist ka naam daalo" });
    }
    await Playlist.create({ name, owner: req.session.userId });
    res.redirect("/playlists");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

exports.show = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.redirect("/playlists");
    const playlist = await Playlist.findOne({ _id: id, owner: req.session.userId }).populate("songs");
    if (!playlist) return res.redirect("/playlists");
    const user = await User.findById(req.session.userId).select("likedSongs");
    const playlists = await Playlist.find({ owner: req.session.userId }).select("name");
    res.render("playlist", {
      playlist,
      songs: playlist.songs,
      likedIds: user.likedSongs.map(String),
      playlists,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.isValidObjectId(id)) {
      await Playlist.deleteOne({ _id: id, owner: req.session.userId });
    }
    res.redirect("/playlists");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

// Playlist mein song add (JSON API)
exports.addSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(songId)) {
      return res.status(400).json({ error: "Invalid data" });
    }
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ error: "Song not found" });
    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, owner: req.session.userId },
      { $addToSet: { songs: songId } },
      { new: true }
    );
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json({ ok: true, name: playlist.name });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Playlist se song remove (form POST)
exports.removeSong = async (req, res) => {
  try {
    const { id, songId } = req.params;
    if (mongoose.isValidObjectId(id) && mongoose.isValidObjectId(songId)) {
      await Playlist.updateOne({ _id: id, owner: req.session.userId }, { $pull: { songs: songId } });
    }
    res.redirect("/playlists/" + id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};