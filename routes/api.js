var express = require('express');
var router = express.Router();
const axios = require("axios");

router.post('/build-quiz', (req, res) => {

  // axios
  //   .post("http://localhost:5000/build-quiz",req.query)
  //   .then((http_res) => {
  //     console.log(`statusCode: ${http_res.status}`);

  //       res.json({ message: 'done' });
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
});

module.exports = router;