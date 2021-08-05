var express = require('express');
var router = express.Router();
const User = require("../models/User");
const utils = require('./utils')
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });
const axios = require("axios");
const API_PATH = require("../config/keys").API_PATH;

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
    res.redirect("verify-users")
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

router.get('/view-inventory', utils.continue_if_admin, async (req, res) => {
    const subject = req.query.subject;

    await client.connect();

    //TODO: get username dynamically
    const org_database = client.db(req.user.organization.replace(" ",""));
    const file_collection = org_database.collection(subject+"_notes.files");
    
    var resp_data = []
    const all_resp = await file_collection.find({}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "file_name":curr_resp.filename,
                "book_name":curr_resp.book_name,
                "author_name":curr_resp.author_name
            } 
            resp_data.push(curr_resp_data);
         }
    );

    curr_info = {
      "subject":subject
    }

    res.render("admin_pages/view_inventory",{layout:'./blank_base', curr_notes:resp_data, curr_info:curr_info, title:"Admin Inventory"});
});

router.get('/view-note',utils.continue_if_admin, (req, res) => {
    const subject = req.query.subject;
    const filename = req.query.filename;
    var _database = req.user.organization.replace(" ","");
    
    var _curr_info = {
      "subject":subject,
      "filename":filename,
      "_database":_database
    }
    // console.log(_curr_info)
    res.render("admin_pages/view_note",{layout:'./blank_base',title:"Viewing File", curr_info:_curr_info});
  })

  
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

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var FormData = require('form-data');
var fs = require('fs');

router.post('/upload-file', utils.continue_if_admin, upload.single('pdf'), async (req, res) => {

      console.log(req.file);
      const form = new FormData();
      form.append(req.file.name, fs.createReadStream(req.file.path));
      form.append("subject",req.body.subject)
      form.append("type","org")
      // TODO : Do this dynamically
      form.append("username","admin123@gmail.com")
      
      const response = await axios({
          method: 'post',
          url: API_PATH + '/upload-file',
          data: form,
          headers: {
              'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
          },
      })

    
});

module.exports = router;
