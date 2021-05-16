var express = require('express');
var router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');


router.get('/login', (req, res) => {
    res.render('login_register', { title: "Login System" });
});

router.post('/login',(req,res,next)=>{
    console.log(req.body.email_input);
    console.log(req.body.password_input);
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next);
});

router.post('/register',(req,res)=>{
    var curr_email = req.body.email_input;
    var curr_password = req.body.password_input;
    User.findOne({email:curr_email}).then(user=>{
        if(user){
            //User Exists
            res.send("ALready registered");
        }else{
        //TODO: Hash password
        //     bcrypt.genSalt(10, (err,salt)=>
        //     bcrypt.hash(curr_password, salt,(err,hash)=>{
        //         if(err) throw err;
        //         curr_password = hash;
        //     })
        // );
        

            const newUser = new User({
                email:curr_email,
                password:curr_password
            });
            console.log(newUser);

            newUser.save().then(user=>{
                //TODO: autologin here
                res.redirect('/dashboard');
            }).catch(err=> console.log(err))

            res.redirect("/dashboard");
        }
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    console.log("Logged out");
    res.redirect('/users/login');
  });

module.exports = router;