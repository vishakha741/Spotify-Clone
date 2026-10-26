const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const { loadUser } = require("./middleware/auth");

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/spotifyclone")
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "spotify-clone-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// 1. sabse pehle loadUser (isse currentUser set hota hai)
app.use(loadUser);

// 2. phir features
app.use("/", require("./routes/features"));

// 3. phir tumhare purane routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/songs"));
app.use("/", require("./routes/playlists"));
// 4. sabse last mein: 404 + error handler
const ExpressError = require("./utils/ExpressError");
const errorHandler = require("./middleware/errorHandler");

app.use((req, res, next) => next(new ExpressError(404, "Page not found")));
app.use(errorHandler);
app.listen(8080, () => console.log("Server running on 8080"));
