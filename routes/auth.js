const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const validateForm = require("../middleware/validateForm");
const { signupSchema, loginSchema } = require("../schemas/authSchema");
router.post("/signup", validateForm(signupSchema, "signup"), auth.signup);
router.post("/signup", auth.signup);
router.post("/login", validateForm(loginSchema, "login"), auth.login);
router.post("/login", auth.login);
router.post("/logout", auth.logout);

module.exports = router;