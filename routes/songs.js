const express = require("express");
const router = express.Router();
const songs = require("../controllers/songController");
const { requireLogin } = require("../middleware/auth");

router.get("/", songs.home);
router.get("/liked", requireLogin, songs.likedPage);
router.post("/api/songs/:id/like", requireLogin, songs.toggleLike);

module.exports = router;