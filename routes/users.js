var express = require("express");
var router = express.Router();
const User = require("../models/User");
const passport = require("passport");


router.get("/login", (req, res) => {
  if (!req.isAuthenticated()) {
    res.render("login_register", { title: "Login System" ,layout:'./login_register_base'});
  } else {
    res.redirect("/dashboard")
  }
});

router.post("/login", (req, res, next) => {
  if (!req.isAuthenticated()) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        User.findOne({ username: req.body.username }, (err, foundUser) => {
          if (err) {
            res.send("Something went wrong, couldn't log you in");
          } else if (foundUser) {
            res.send("Incorrect password");
          } else {
            res.send("Couldn't find a user with the given email address");
          }
        });
      } else {
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          } else {
            res.redirect("/dashboard");
          }
        });
      }
    })(req, res, next);

    
  }
});

router.post("/register", (req, res) => {
  var curr_username = req.body.username;
  var curr_password = req.body.password;
  const newUser = new User({
    username: curr_username,
    organization:"ABVIIITM"
  });

  User.register(newUser, curr_password, (err, user) => {
    if (err) {
      res.send(err.message);
    } else {
      console.log("Registered user");
      res.redirect("/users/login");
    }
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  console.log("Logged out");
  res.redirect("/users/login");
});

module.exports = router;
