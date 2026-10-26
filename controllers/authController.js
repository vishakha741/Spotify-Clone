const bcrypt = require("bcryptjs");
const User = require("../models/User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.showSignup = (req, res) => {
  res.render("signup", { error: null, form: {} });
};

exports.signup = async (req, res) => {
  const { username = "", email = "", password = "" } = req.body;
  const form = { username, email };
  try {
    if (username.trim().length < 3) {
      return res.render("signup", { error: "Username kam se kam 3 characters ka ho", form });
    }
    if (!emailRegex.test(email)) {
      return res.render("signup", { error: "Sahi email daalo", form });
    }
    if (password.length < 6) {
      return res.render("signup", { error: "Password kam se kam 6 characters ka ho", form });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.render("signup", { error: "Is email se account pehle se hai", form });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("signup", { error: "Kuch galat ho gaya, dobara try karo", form });
  }
};

exports.showLogin = (req, res) => {
  res.render("login", { error: null, form: {} });
};

exports.login = async (req, res) => {
  const { email = "", password = "" } = req.body;
  const form = { email };
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.render("login", { error: "Email ya password galat hai", form });
    }
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("login", { error: "Kuch galat ho gaya, dobara try karo", form });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};