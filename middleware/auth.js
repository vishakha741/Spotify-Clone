const User = require("../models/User");

// Har request par logged-in user ko views ke liye available karao
async function loadUser(req, res, next) {
  res.locals.currentUser = null;
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select("username likedSongs");
      if (user) res.locals.currentUser = user;
      else req.session.userId = null;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}

// Login ke bina access nahi
function requireLogin(req, res, next) {
  if (req.session.userId) return next();
  if (req.originalUrl.startsWith("/api")) {
    return res.status(401).json({ error: "Please login first" });
  }
  res.redirect("/login");
}

module.exports = { loadUser, requireLogin };