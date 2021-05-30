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
  res.render("quizzer_prep", { layout: "./quizzer_layout",status:"please wait",num_questions: req.query.num_questions, quiz_time: req.query.quiz_time, subject: req.query.subject});
});

router.get("/quiz", async (req, res) => {
  var quiz_code = req.query.quizcode.split("\"")[3];

  // await client.connect();
  // //TODO: get username dynamcally
  // const user_database = client.db("admin123");
  // const quiz_collection = user_database.collection("quizzes");
  // const query = {
  //   _id:new mongo.ObjectID(quiz_code)
  // }

  // const curr_quiz = await quiz_collection.findOne(query);
  // console.log(curr_quiz);
  curr_quiz = {
    _id: "60af752352dbc4190f5ea09f",
    created_on: "2021-05-27T16:02:03.791Z",
    num_questions: 2,
    subject: 'dsa',
    quiz_time: 2,
    questions: [
      {
        question: 'What is size of a byte?',
        topic: 'Basic Data Types',
        answer: '8 bits',
        options: ['1 bit','2 bit','4 bit','8 bit']
      },
      {
        question: 'What is start index of array in C++',
        topic: 'Array',
        answer: '0',
        options: ['0','1','2','3']
      },
      {
        question: 'What is size of a byte?',
        topic: 'Basic Data Types',
        answer: '8 bits',
        options: ['1 bit','2 bit','4 bit','8 bit']
      },
      {
        question: 'What is start index of array in C++',
        topic: 'Array',
        answer: '0',
        options: ['0','1','2','3']
      },
      {
        question: 'What is size of a byte?',
        topic: 'Basic Data Types',
        answer: '8 bits',
        options: ['1 bit','2 bit','4 bit','8 bit']
      },
      {
        question: 'What is start index of array in C++',
        topic: 'Array',
        answer: '0',
        options: ['0','1','2','3']
      },
      {
        question: 'What is size of a byte?',
        topic: 'Basic Data Types',
        answer: '8 bits',
        options: ['1 bit','2 bit','4 bit','8 bit']
      },
      {
        question: 'What is start index of array in C++',
        topic: 'Array',
        answer: '0',
        options: ['0','1','2','3']
      },
      {
        question: 'What is size of a byte?',
        topic: 'Basic Data Types',
        answer: '8 bits',
        options: ['1 bit','2 bit','4 bit','8 bit']
      },
      {
        question: 'What is start index of array in C++',
        topic: 'Array',
        answer: '0',
        options: ['0','1','2','3']
      },
      {
        question: 'What is size of a byte?',
        topic: 'Basic Data Types',
        answer: '8 bits',
        options: ['1 bit','2 bit','4 bit','8 bit']
      },
      {
        question: 'What is start index of array in C++',
        topic: 'Array',
        answer: '0',
        options: ['0','1','2','3']
      }
    ]
  }
  res.render("quizzer_main",{layout:"./quizzer_layout",quiz_data:curr_quiz});
});

router.post("/submit",(req,res) => {
  console.log(req.body);
  res.send("quiz submitted")
});

module.exports = router;
