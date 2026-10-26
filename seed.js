const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Song = require("./models/Song");


  
  const info = {
  "beast-mode": { title: "Beast Mode", artist: "Rohan Verma", mood: "workout" },
  "raat-ki-baarish": { title: "Raat Ki Baarish", artist: "Kabir Singh Rathore", mood: "sad" },
  "yaadon-ka-safar": { title: "Yaadon Ka Safar", artist: "Meera Joshi", mood: "sad" },
};
};

const assetsDir = path.join(__dirname, "public", "assets");
const songsDir = path.join(assetsDir, "songs");
const imgExt = [".jpg", ".jpeg", ".png", ".webp"];

function findImage(base) {
  const hit = fs.readdirSync(assetsDir).find(
    (f) =>
      path.parse(f).name.toLowerCase() === base.toLowerCase() &&
      imgExt.includes(path.extname(f).toLowerCase())
  );
  return hit ? "/assets/" + hit : "/assets/cardimg.jpeg";
}

(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/spotifyclone");

  const files = fs
    .readdirSync(songsDir)
    .filter((f) => /\.(mp3|m4a|wav|ogg)$/i.test(f));

  const docs = files.map((file) => {
    const base = path.parse(file).name;
    const extra = info[base] || {};
    return {
      title: extra.title || base.replace(/[-_]+/g, " "),
      artist: extra.artist || "Unknown Artist",
      image: findImage(base),
      audioUrl: "/assets/songs/" + file,
      mood: extra.mood || "chill",
      duration: 180,
    };
  });

  await Song.deleteMany({});
  await Song.insertMany(docs);

  docs.forEach((d) => console.log(d.title, "|", d.mood, "|", d.audioUrl, "|", d.image));
  process.exit(0);
})();