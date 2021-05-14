var express = require('express');
var router = express.Router();

const creds = {
    email: "admin@gmail.com",
    password: "admin123"
}

router.post('/login',(req,res)=>{
    console.log(req.body.email_input);
    if(req.body.email_input == creds.email && req.body.password_input == creds.password){
        req.session.user = req.body.email_input;
        res.redirect('/route/dashboard');
    }else{
        res.end("Invalid Login ID or Password");
    }
});

router.get('/dashboard',(req,res)=>{
    if(req.session.user){
        res.render('dashboard',{user:req.session.user,title: "Login System"})
    }else{
        res.send("Unauthorized User");
    }
});

router.get('/logout',(req,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            red.send("Error");
        }else{
            res.render('base',{title:"Loggedout"})
        }
    });
});

module.exports = router;