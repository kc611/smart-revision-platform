var express = require("express");
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });

function isUser(req, res, next) {
  if(req.isAuthenticated()){
      return next();
  } else{
      return res.redirect("/users/login");
  }
}

router.get("/quiz", isUser, async (req, res) => {
  var quiz_code = req.query.quizcode;

  await client.connect();
  //TODO: get username dynamcally
  const user_database = client.db(req.user.username);
  const quiz_collection = user_database.collection("quizzes");
  const query = {
    _id:new mongo.ObjectID(quiz_code)
  }

  const curr_quiz = await quiz_collection.findOne(query);

  curr_quiz['quiz_code'] = quiz_code;

  res.render("quizzer_main",{layout:"./quizzer_layout",quiz_data:curr_quiz});
});

router.post("/submit", isUser, async (req,res) => {

  res.render("quizzer_submitted",{layout:"./quizzer_layout"});

  var num_questions = req.body.num_questions;
  var responses = {};
  await client.connect();

  const user_database = client.db(req.user.username);
  const response_collection = user_database.collection("responses");
  const incorrect_collection = user_database.collection("incorrects");
  const quiz_collection = user_database.collection("quizzes");
  const query = {
    _id:new mongo.ObjectID(req.body.quiz_code)
  }

  const curr_quiz = await quiz_collection.findOne(query);

  var correct_resp = 0;
  var incorrect_resp = 0;
  var unanswered_resp= 0;
  var report_reqs = {}; 
  var incorrect_questions = []

  for (i = 0; i < num_questions; i++) {
    curr_response = req.body[i.toString()];
    if (curr_response == undefined){
      curr_response = "-1";
      unanswered_resp = unanswered_resp+1;
    }else{
      if(curr_response == curr_quiz.questions[i].answer){
        correct_resp = correct_resp+1;
      }else{
        incorrect_questions.push(curr_quiz.questions[i])
        incorrect_resp = incorrect_resp + 1;
      }
    }
    responses[i] = curr_response;
    report_reqs[i] = "0";
  }

  const responseObject = {
    "quiz_code":req.body.quiz_code,
    "submit_time":new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}),
    "responses":responses,
    "correct_resp":correct_resp,
    "num_questions":req.body.num_questions,
    "incorrect_resp":incorrect_resp,
    "unanswered_resp":unanswered_resp,
    "quiz_name":req.body.quiz_name,
    "report_reqs":report_reqs,
    "subject":curr_quiz.subject
  }
  const incorrectObject = {
    "quiz_code":req.body.quiz_code,
    "submit_time":new Date().toLocaleString(undefined, {timeZone: 'Asia/Kolkata'}),
    "num_questions":incorrect_questions.length,
    "subject":curr_quiz.subject,
    "questions":incorrect_questions
  }

  response_collection.insertOne(responseObject);
  if (incorrect_questions.length > 0){
    incorrect_collection.insertOne(incorrectObject)
  }
    

});

module.exports = router;
