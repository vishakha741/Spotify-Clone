const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Song = require("./models/Song");

const info = {
  song1:  { title: "Sunshine Morning", artist: "Aarav Mehta",         mood: "happy" },
  song2:  { title: "Lofi Evenings",    artist: "Silent Ocean",        mood: "chill" },
  song3:  { title: "Chai Aur Baarish", artist: "Ananya Rao",          mood: "chill" },
  song4:  { title: "Raat Ki Baarish",  artist: "Kabir Singh Rathore", mood: "sad" },
  song5:  { title: "Yaadon Ka Safar",  artist: "Meera Joshi",         mood: "sad" },
  song6:  { title: "Beast Mode",       artist: "Rohan Verma",         mood: "workout" },
  song7:  { title: "Run The City",     artist: "Iron Pulse",          mood: "workout" },
};

const assetsDir = path.join(__dirname, "public", "assets");
const songsDir = path.join(assetsDir, "songs");

const allImages = fs.readdirSync(assetsDir);
const cards = allImages
  .filter((f) => /^card\d+img\.(jpe?g|png)$/i.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

function pickImage(base, index) {
  const own = allImages.find(
    (f) => path.parse(f).name.toLowerCase() === base.toLowerCase() && /\.(jpe?g|png|webp|svg)$/i.test(f)
  );
  if (own) return "/assets/" + own;
  if (cards.length) return "/assets/" + cards[index % cards.length];
  return "";
}

(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/spotifyclone");

  const files = fs
    .readdirSync(songsDir)
    .filter((f) => /\.(mp3|m4a|wav|ogg)$/i.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/) || 0) - parseInt(b.match(/\d+/) || 0));

  const docs = files.map((file, i) => {
    const base = path.parse(file).name;
    const extra = info[base] || {};
    return {
      title: extra.title || base,
      artist: extra.artist || "Unknown Artist",
      image: pickImage(base, i),
      audioUrl: "/assets/songs/" + file,
      mood: extra.mood || "chill",
      duration: 180,
    };
  });

  await Song.deleteMany({});
  await Song.insertMany(docs);

  docs.forEach((d) => console.log(d.title, "|", d.mood, "|", d.audioUrl, "|", d.image));
  console.log(docs.length + " songs add hue");
  process.exit(0);
})();