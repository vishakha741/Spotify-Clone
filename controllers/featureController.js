const Song = require("../models/Song");
const Playlist = require("../models/Playlist");
const PlayLog = require("../models/PlayLog");

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

// ---------- 1. MOOD ----------
exports.getSongs = wrap(async (req, res) => {
  const { mood } = req.query;
  const filter = {};
  if (mood && mood !== "All") filter.mood = new RegExp(`^${mood}$`, "i");
  const songs = await Song.find(filter).limit(60);
  res.json(songs);
});

// ---------- 3. LISTENING STATS ----------
exports.logPlay = wrap(async (req, res) => {
  const { listenerId, songId, seconds } = req.body;
  if (!listenerId || !songId || !(seconds > 0)) {
    return res.status(400).json({ error: "listenerId, songId, seconds required" });
  }
  const song = await Song.findById(songId);
  if (!song) return res.status(404).json({ error: "Song not found" });
  await PlayLog.create({
    listenerId,
    song: song._id,
    title: song.title,
    artist: song.artist,
    seconds: Math.round(seconds),
  });
  res.json({ ok: true });
});

exports.getStats = wrap(async (req, res) => {
  const { listenerId } = req.query;
  if (!listenerId) return res.status(400).json({ error: "listenerId required" });

  const match = { $match: { listenerId } };
  const [topSongs, topArtists, total] = await Promise.all([
    PlayLog.aggregate([
      match,
      {
        $group: {
          _id: "$song",
          title: { $first: "$title" },
          artist: { $first: "$artist" },
          plays: { $sum: 1 },
          seconds: { $sum: "$seconds" },
        },
      },
      { $sort: { seconds: -1 } },
      { $limit: 5 },
    ]),
    PlayLog.aggregate([
      match,
      { $group: { _id: "$artist", plays: { $sum: 1 }, seconds: { $sum: "$seconds" } } },
      { $sort: { seconds: -1 } },
      { $limit: 5 },
    ]),
    PlayLog.aggregate([match, { $group: { _id: null, seconds: { $sum: "$seconds" } } }]),
  ]);

  res.json({
    totalMinutes: Math.round((total[0]?.seconds || 0) / 60),
    topSongs,
    topArtists,
  });
});

// ---------- 4. PLAYLIST + SHARE LINK ----------
exports.createPlaylist = wrap(async (req, res) => {
  const { name, ownerId } = req.body;
  if (!name || !ownerId) return res.status(400).json({ error: "name and ownerId required" });
  const playlist = await Playlist.create({ name, ownerId });
  res.status(201).json(playlist);
});

exports.myPlaylists = wrap(async (req, res) => {
  const { ownerId } = req.query;
  if (!ownerId) return res.status(400).json({ error: "ownerId required" });
  res.json(await Playlist.find({ ownerId }).sort({ createdAt: -1 }));
});

exports.addSong = wrap(async (req, res) => {
  const { songId, ownerId } = req.body;
  const playlist = await Playlist.findOne({ _id: req.params.id, ownerId });
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  if (!playlist.songs.some((s) => s.toString() === songId)) {
    playlist.songs.push(songId);
    await playlist.save();
  }
  res.json(playlist);
});

exports.sharePage = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ shareId: req.params.shareId }).populate("songs");
    if (!playlist) return res.status(404).send("Playlist not found");
    res.render("share", { playlist });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};