var express = require("express");
var router = express.Router();
const querystring = require("querystring");
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });

//This is the post end node for quiz making
router.post("/make-quiz", (req, res) => {
  var query_string = querystring.stringify(req.body);
  res.redirect("/quizzer/prep-quiz?" + query_string);
});

//This the the node that renders the page for quiz prep
router.get("/prep-quiz", (req, res) => {
  res.render("quizzer_prep", { layout: "./quizzer_layout",status:"please wait",num_questions: req.query.num_questions, quiz_time: req.query.quiz_time, subject: req.query.subject,quiz_name: req.query.quiz_name});
});

router.get("/quiz", async (req, res) => {
  var quiz_code = req.query.quizcode.split("\"")[3];

  await client.connect();
  //TODO: get username dynamcally
  const user_database = client.db("admin123");
  const quiz_collection = user_database.collection("quizzes");
  const query = {
    _id:new mongo.ObjectID(quiz_code)
  }

  const curr_quiz = await quiz_collection.findOne(query);

  curr_quiz['quiz_code'] = quiz_code;
  res.render("quizzer_main",{layout:"./quizzer_layout",quiz_data:curr_quiz});
});

router.post("/submit",async (req,res) => {

  res.render("quizzer_submitted",{layout:"./quizzer_layout"});

  var num_questions = req.body.num_questions;
  var responses = {};
  await client.connect();
  //TODO: get username dynamcally
  const user_database = client.db("admin123");
  const response_collection = user_database.collection("responses");
  const quiz_collection = user_database.collection("quizzes");
  const query = {
    _id:new mongo.ObjectID(req.body.quiz_code)
  }

  const curr_quiz = await quiz_collection.findOne(query);

  var total_points = 0;

  for (i = 0; i < num_questions; i++) {
    curr_response = req.body[i.toString()];
    if (curr_response == undefined){
      curr_response = "-1";
    }else{
      if(curr_quiz.questions[i].options[curr_response] == curr_quiz.questions[i].answer){
        total_points = total_points+1;
      }
    }
    responses[i] = curr_response;
  }

  const responseObject = {
    "quiz_code":req.body.quiz_code,
    "submit_time":new Date().getTime(),
    "responses":responses,
    "total_points":total_points,
    "max_points":req.body.num_questions
  }

  var response_code = response_collection.insertOne(responseObject);

  router.post('/build-report',data={"quiz_code":req.body.quiz_code,"response_code":response_code._id});
});

module.exports = router;
