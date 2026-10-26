const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "public", "assets");
const songsDir = path.join(assetsDir, "songs");

// Cover par jo naam dikhana hai wo yahan likho (file ka naam bina .mp3 ke)
const titles = {
  song1: "Sunshine Morning",
  song2: "Lofi Evenings",
  song3: "Chai Aur Baarish",
  song4: "Raat Ki Baarish",
  song5: "Yaadon Ka Safar",
  song6: "Beast Mode",
  song7: "Run The City",
};

const palettes = [
  ["#1db954", "#0b3d2e"], ["#ff6b6b", "#4a1942"], ["#4facfe", "#1b1f4b"],
  ["#f7b733", "#7a2e0e"], ["#a18cd1", "#2b1b4d"], ["#43e97b", "#0f3b3b"],
  ["#fa709a", "#3a1c4f"], ["#30cfd0", "#1a2a5c"],
];

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// lamba naam 2 lines mein toot jata hai
function split(title) {
  const words = title.split(" ");
  if (title.length <= 14 || words.length < 2) return [title, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const files = fs
  .readdirSync(songsDir)
  .filter((f) => /\.(mp3|m4a|wav|ogg)$/i.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/) || 0) - parseInt(b.match(/\d+/) || 0));

files.forEach((file, i) => {
  const base = path.parse(file).name;
  const title = titles[base] || base;
  const [c1, c2] = palettes[i % palettes.length];
  const [l1, l2] = split(title);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="320" cy="80" r="90" fill="#ffffff" opacity="0.08"/>
  <circle cx="60" cy="350" r="120" fill="#000000" opacity="0.15"/>
  <g transform="translate(150,110)" fill="#ffffff" opacity="0.9">
    <path d="M70 0 v70 a22 22 0 1 0 14 20 v-60 l38 -10 v40 a22 22 0 1 0 14 20 v-80 z"/>
  </g>
  <text x="30" y="300" font-family="Arial, sans-serif" font-weight="bold" font-size="34" fill="#ffffff">${esc(l1)}</text>
  <text x="30" y="342" font-family="Arial, sans-serif" font-weight="bold" font-size="34" fill="#ffffff">${esc(l2)}</text>
</svg>`;

  fs.writeFileSync(path.join(assetsDir, base + ".svg"), svg);
  console.log("cover bana:", base + ".svg");
});

console.log(files.length + " covers ban gaye");