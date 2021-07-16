var express = require("express");
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });
var fs = require('fs');
var Grid = require('gridfs');

router.get("/org", async (req, res) => {
    const subject = req.query.subject;

    await client.connect();

    //TODO: get username dynamically
    const org_database = client.db("ABVIIITM");
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
    // res.render("reports_main",{layout:'./reports_layout',title:"Report on "+curr_quiz.quiz_name,curr_response:curr_response,curr_quiz:curr_quiz});
   
    
    curr_info = {
      "subject":subject
    }
    res.render("inventory_pages/inventory_org",{layout:'./inventory_pages/inventory_base', curr_notes:resp_data, curr_info:curr_info});
});

router.get("/usr", async (req, res) => {
  const subject = req.query.subject;

  await client.connect();

  //TODO: get username dynamically
  const org_database = client.db("ABVIIITM");
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
  // res.render("reports_main",{layout:'./reports_layout',title:"Report on "+curr_quiz.quiz_name,curr_response:curr_response,curr_quiz:curr_quiz});

  
  curr_info = {
    "subject":subject
  }
  res.render("inventory_pages/inventory_usr",{layout:'./inventory_pages/inventory_base', curr_notes:resp_data, curr_info:curr_info});
});

router.get('/view',(req, res) => {
  const subject = req.query.subject;
  const filename = req.query.filename;
  const type = req.query.type;
  var _database;

  if(type=="usr"){
    _database = req.user;
  }else if(type=="org"){
    // TODO: Get this dynamically
    _database = "ABVIIITM"
  }

  var _curr_info = {
    "subject":subject,
    "filename":filename,
    "_database":_database
  }
  // console.log(_curr_info)
  res.render("inventory_pages/view_page",{layout:'./blank_base',title:"Viewing File", curr_info:_curr_info});
})

module.exports = router;
