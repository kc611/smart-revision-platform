var express = require('express');
var router = express.Router();
const axios = require("axios");

// This request goes to external flask API
router.post('/build-quiz', (req, res) => {
  var curr_data = {
    "username":"admin123@gmail.com",
    "organization":"ABVIIITM",
    "subject":req.body.subject,
    "num_questions":req.body.num_questions,
    "quiz_time":req.body.quiz_time,
    "quiz_name":req.body.quiz_name
  };

  axios
    .post("http://localhost:5000/build-quiz",JSON.stringify(curr_data))
    .then((http_res) => {
      res.json({ message: 'done',quiz_code: JSON.stringify(http_res.data)});
    })
    .catch((error) => {
      console.error("Error in api.js build-quiz request");
      console.log(error);
    });
});

router.post('/build-report', (req, res) => {
  var curr_data = {
    "username":"admin123@gmail.com",
    "organization":"ABVIIITM",
    "response_code":req.body.response_code,
    "quiz_code":req.body.quiz_code
  };

  axios
    .post("http://localhost:5000/build-report",JSON.stringify(curr_data))
    .then((http_res) => {
      //Do something?
    })
    .catch((error) => {
      console.error("Error in api.js build-quiz request");
      console.log(error);
    });
});


module.exports = router;