var express = require("express");
var router = express.Router();
const querystring = require("querystring");

//This is the post end node for quiz making
router.post("/make-quiz", (req, res) => {
  var query_string = querystring.stringify(req.body);
  res.redirect("/quizzer/prep-quiz?" + query_string);
});

//This the the node that renders the page for quiz prep
router.get("/prep-quiz", (req, res) => {
  res.render("quizzer_prep", { layout: "./quizzer_layout",status:"please wait",num_questions: req.query.num_questions, quiz_time: req.query.quiz_time, subject: req.query.subject});
});

router.get("/quiz", (req, res) => {
  console.log(req.query);
  res.render("quizzer_main",{layout:"./quizzer_layout"});
});


module.exports = router;
