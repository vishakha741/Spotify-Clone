const express = require("express");
const router = express.Router();
const pl = require("../controllers/playlistController");
const { requireLogin } = require("../middleware/auth");

router.get("/playlists", requireLogin, pl.list);
router.post("/playlists", requireLogin, pl.create);
router.get("/playlists/:id", requireLogin, pl.show);
router.post("/playlists/:id/delete", requireLogin, pl.remove);
router.post("/playlists/:id/songs/:songId/remove", requireLogin, pl.removeSong);
router.post("/api/playlists/:id/songs", requireLogin, pl.addSong);

module.exports = router;