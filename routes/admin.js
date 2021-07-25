var express = require('express');
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const User = require("../models/User");
const utils = require('./utils')

router.post('/register', (req, res) => {
    var curr_username = req.body.username;
    var curr_password = req.body.password;
    var curr_college_name = req.body.college_name
    const newUser = new User({
        username: curr_username,
        organization: curr_college_name,
        is_admin: true,
        verified: true
    });

    User.register(newUser, curr_password, (err, user) => {
        if (err) {
            res.send({"status":"Error", "msg":err})
        } else {
            console.log("Registered Org");
            res.send({"status":"Successfully Registered"})
        }
    });
});

router.get('/dashboard', utils.continue_if_admin, (req, res) => {
    res.render("admin_pages/dashboard",{layout:'./blank_base',title:"Admin Dashboard"});
})

module.exports = router;
