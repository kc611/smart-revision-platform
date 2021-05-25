var express = require("express");
var router = express.Router();
const querystring = require("querystring");

router.post("/make-quiz", (req, res) => {
  var query_string = querystring.stringify(req.body);
  res.redirect("/quizzer/prep-quiz?" + query_string);
});

router.get("/prep-quiz", (req, res,next) => {
//   console.log(req.query.num_questions);

  res.render("quizzer_prep", { layout: "./quizzer_layout",status:"please wait" });

});

module.exports = router;
