const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "public", "assets", "songs");

fs.readdirSync(dir).forEach((f) => {
  if (/\.mp3\.mp3$/i.test(f)) {
    fs.renameSync(path.join(dir, f), path.join(dir, f.replace(/\.mp3\.mp3$/i, ".mp3")));
    console.log("rename hua:", f);
  }
});