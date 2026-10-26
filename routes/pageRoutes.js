const router = require("express").Router();
const wrapAsync = require("../utils/wrapAsync");
const { home } = require("../controllers/pageController");

router.get("/", wrapAsync(home));

module.exports = router;