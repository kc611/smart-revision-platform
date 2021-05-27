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
    "quiz_time":req.body.quiz_time
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



module.exports = router;