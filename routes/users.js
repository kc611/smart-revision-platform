var express = require("express");
var router = express.Router();
const User = require("../models/User");
const passport = require("passport");
const utils = require('./utils')

router.get("/login", utils.to_dashboard_if_user, async (req, res) => {
  var org_list = await utils.get_org_list();
  var org_pattern = "";
  for(_org of org_list){
    org_pattern+=_org
    org_pattern+="|"
  }
  org_pattern = org_pattern.substring(0, org_pattern.length - 1);

  var resp_data = {
    sign_up:false,
    org_list:org_list,
    org_pattern:org_pattern
  }

  res.render("login_page/login_register", {resp_data:resp_data, title: "Sign in to Smart Revision" ,layout:'./blank_base'});
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
            req.flash("error","Something went wrong, couldn't log you in");
          } else if (foundUser) {
            req.flash("error","Incorrect password");
          } else {
            req.flash("error","No user found with the given email address");
          }
          res.redirect("/users/login")
        });
        
      } else {
        // TODO:Confirmation await if not verified
        if(user.verified){
          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            } else {
              if(req.user.is_admin==true){
                res.redirect("/admin/dashboard")
              }else{
                res.redirect("/dashboard");
              }
            }
          });
        }else{
          req.flash("error","User not yet verified by organization. Please wait for confirmation.");
          res.redirect("/users/login")
        }
        
      }
    })(req, res, next);
  }

});

router.post("/register", (req, res) => {
  var curr_username = req.body.username;
  var curr_password = req.body.password;
  var curr_org = req.body.organization;

  
  const newUser = new User({
    username: curr_username,
    organization: curr_org,
    is_admin:false,
    verified:false
  });

  User.register(newUser, curr_password, (err, user) => {
    if (err) {
      req.flash("error",err.message);
    } else {
      req.flash("success","Registered user sucessfully! Please wait for confirmation from organization.");
    }
    res.redirect("/users/login");
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  console.log("Logged out");
  res.redirect("/users/login");
});

module.exports = router;
