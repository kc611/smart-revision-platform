var express = require('express');
var router = express.Router();
const User = require("../models/User");
const utils = require('./utils')
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });

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
    res.render("admin_pages/dashboard_main",{layout:'./admin_pages/dashboard_base',title:"Admin Dashboard"});
});


router.get('/verify-users', utils.continue_if_admin, async (req, res) => {
    await client.connect();

    const org_database = client.db("test");
    const user_collections = org_database.collection("users");
    
    var resp_data = []
    await user_collections.find({organization:req.user.organization, verified:false}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "username":curr_resp.username,
                "email":curr_resp.email
            } 
            resp_data.push(curr_resp_data);
         }
    );

    res.render("admin_pages/dashboard_verify",{layout:'./admin_pages/dashboard_base',title:"Verify Student Profile", resp_data:resp_data});
});


router.get('/inventory', utils.continue_if_admin, async (req, res) => {
    await client.connect();

    const org_database = client.db(req.user.organization.replace(" ",""));
    const user_collections = org_database.collection("subjects");
    
    var resp_data = []
    await user_collections.find({}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "subject_name":curr_resp.subject_name,
                "subject_code":curr_resp.subject_code
            } 
            resp_data.push(curr_resp_data);
         }
    );

    res.render("admin_pages/dashboard_notes",{layout:'./admin_pages/dashboard_base',title:"Upload Notes",resp_data:resp_data});
});

router.get('/verify', utils.continue_if_admin, async (req, res) => {
    var unverified_user = req.query.user;

    await client.connect();

    const org_database = client.db("test");
    const user_collections = org_database.collection("users");
    const updateDoc = {
        $set: {
          verified:true
        },
      };

    user_collections.updateOne({username:unverified_user, verified:false},updateDoc);


    res.redirect("verify-users");
});

router.post('/add-subject', utils.continue_if_admin, async (req, res) => {
    var subject_name = req.body.subject_name;
    var subject_code = req.body.subject_code;

    await client.connect();

    const org_database = client.db(req.user.organization.replace(" ",""));
    const sub_collections = org_database.collection("subjects");

    const responseObject = {
        "subject_name":subject_name,
        "subject_code":subject_code.replace(" ","")
    }
    
    sub_collections.insertOne(responseObject);

    res.redirect("inventory");
});

module.exports = router;
