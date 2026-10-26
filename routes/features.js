const express = require("express");
const router = express.Router();
const c = require("../controllers/featureController");

router.get("/api/songs", c.getSongs);
router.post("/api/stats/log", c.logPlay);
router.get("/api/stats", c.getStats);
router.post("/api/playlists", c.createPlaylist);
router.get("/api/playlists", c.myPlaylists);
router.post("/api/playlists/:id/songs", c.addSong);
router.get("/share/:shareId", c.sharePage);

module.exports = router;