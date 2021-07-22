var express = require("express");
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });
var fs = require('fs');
var Grid = require('gridfs');


router.get("/collection", async (req, res) => {
  const quiz_code = req.query.quiz_code;

  await client.connect();

  //TODO: get username dynamically
  const usr_database = client.db(req.user.username.split("@")[0]);
  const suggestion_collection = usr_database.collection("suggestions");
  const quiz_collection = user_database.collection("quizzes");
  const query = {
    _id:new mongo.ObjectID(quiz_code)
  }

  const curr_quiz = await quiz_collection.findOne(query);

  var resp_data = []
  const all_resp = await suggestion_collection.find({"quiz_code":quiz_code}).forEach(
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
    "subject":curr_quiz.subject,
  }

  res.render("reading_pages/collection",{layout:'./blank_base', curr_notes:resp_data, curr_info:curr_info});
});

module.exports = router;
