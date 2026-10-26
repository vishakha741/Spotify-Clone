const router = require("express").Router();
const wrapAsync = require("../utils/wrapAsync");
const validate = require("../middleware/validate");
const { songSchema } = require("../schemas/songSchema");
const ctrl = require("../controllers/songController");

router.get("/", wrapAsync(ctrl.getAll));
router.get("/:id", wrapAsync(ctrl.getOne));
router.post("/", validate(songSchema), wrapAsync(ctrl.create));
router.delete("/:id", wrapAsync(ctrl.remove));

module.exports = router;