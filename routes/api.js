var express = require('express');
var router = express.Router();
const axios = require("axios");
var nodemailer = require('nodemailer');
const API_PATH = require("../config/keys").API_PATH;

router.post('/contact', (req, res) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'smart.rev.acc@gmail.com',
      pass: '2smart2rev'
    }
  });

  if(req.body.name.isEmpty()){
    // TODO: send message that feild is empty
  }
  email_text = "Name : " + req.body.name + "\nEmail : " + req.body.email + "\nNumber : " + req.body.number + "\nSubject : " + req.body.subject + "\nMessage : " + req.body.message; 

  var mailOptions = {
    from: 'smart.rev.acc@gmail.com',
    to: 'smart.rev.acc@gmail.com',
    subject: 'Support Reqested',
    text: email_text
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      // TODO: send message that error
    } else {
      // TODO: send message that emailed sucessfully
    }
  });
})

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
    .post(API_PATH + "/build-quiz",JSON.stringify(curr_data))
    .then((http_res) => {
      res.json({ message: 'done',quiz_code: JSON.stringify(http_res.data).split("\"")[3]});
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
    .post(API_PATH + "/build-report",JSON.stringify(curr_data))
    .then((http_res) => {
      //Do something?
    })
    .catch((error) => {
      console.error("Error in api.js build-quiz request");
      console.log(error);
    });
});

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var FormData = require('form-data');
var fs = require('fs');


router.post('/upload-file', upload.single('pdf'), async (req,res) => {
  console.log(req.file);

  const form = new FormData();
  form.append(req.file.name, fs.createReadStream(req.file.path));
  form.append("subject",req.body.subject)
  // TODO : Do this dynamically
  form.append("type","usr")
  form.append("username","admin123@gmail.com")
  
  const response = await axios({
      method: 'post',
      url: API_PATH + '/upload-file',
      data: form,
      headers: {
          'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
      },
  })

})


module.exports = router;