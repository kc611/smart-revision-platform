require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
var favicon = require("serve-favicon");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const db = require("./config/keys").MongoURI;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const app = express();
const expressLayouts = require('express-ejs-layouts');
// require('./config/passport')(passport);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use(express.json({
  type: ['application/json', 'text/plain']
}));

app.use(expressLayouts);
app.set('layout', './landing_page/landing_base');
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

var cors = require('cors')

app.use(cors()) // Use this after the variable declaration

app.use("/", require("./routes/index"));
app.use("/api",require("./routes/api"));
app.use("/users", require("./routes/users"));
app.use("/notes",require("./routes/notes"));
app.use("/quizzer",require("./routes/quizzes"));
app.use("/reading",require("./routes/reading"));
app.use("/admin",require("./routes/admin"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

app.get("*", (req, res) => {
  console.log(`Tried accessing ${req.url}`);
  res.send("404");
});

app.listen(PORT, () => {
  console.log(`Serving app on port ${PORT}`);
  console.log(`Link: http://localhost:${PORT}`);
});
