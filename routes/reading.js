var express = require("express");
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });
const utils = require('./utils')

router.get("/collection", utils.continue_if_user, async (req, res) => {
  const quiz_code = req.query.quiz_code;

  await client.connect();

  //TODO: get username dynamically
  const usr_database = client.db(req.user.username.split("@")[0]);
  const suggestion_collection = usr_database.collection("suggestions");
  const quiz_collection = usr_database.collection("quizzes");
  const query = {
    _id:new mongo.ObjectID(quiz_code)
  }

  const curr_quiz = await quiz_collection.findOne(query);

  var resp_data = []
  await suggestion_collection.find({"quiz_code":quiz_code}).forEach(
    function(curr_resp) { 
        curr_question_no = curr_resp.question_number
        var curr_resp_data = {
            "question":curr_quiz.questions[curr_question_no].question,
            "question_number":curr_question_no,
            "answer":curr_quiz.questions[curr_question_no].options[curr_quiz.questions[curr_question_no].answer],
            "explaination":curr_quiz.questions[curr_question_no].explain
        } 
        resp_data.push(curr_resp_data);
      }
  );
  
  curr_info = {
    "quiz_code":quiz_code,
    "quiz_name":curr_quiz.quiz_name,
    "subject":curr_quiz.subject,
    "num_questions":curr_quiz.num_questions,
    "_database":req.user.username.split("@")[0]
  }

  res.render("reading_pages/collection",{layout:'./blank_base', curr_sugg:resp_data, curr_info:curr_info, title:curr_quiz.quiz_name+" Reading Suggestions"});
});

module.exports = router;
