var express = require('express');
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

router.get('/', (req, res) => {
    res.render('landing_page');
});

router.get('/dashboard', isUser, (req, res) => {
    res.render("dashboard_main",{layout: './dashboard_base', title:"Dashboard"});
});

router.get('/quizzes', isUser, (req,res)=>{
    res.render("dashboard_quizzes",{layout:'./dashboard_base',title:"Quizzes"});
});

router.get('/reports', isUser, async (req,res)=>{
    const response_code = req.query.response_code;

    await client.connect();

    //TODO: get username dynamically
    const user_database = client.db("admin123");
    const response_collection = user_database.collection("responses");
    const quiz_collection = user_database.collection("quizzes");
    
    const curr_response = await response_collection.findOne({_id:new mongo.ObjectID(response_code)});
    const curr_quiz = await quiz_collection.findOne({_id:new mongo.ObjectID(curr_response['quiz_code'])});

    res.render("reports_main",{layout:'./reports_layout',title:"Report on "+curr_quiz.quiz_name,curr_response:curr_response,curr_quiz:curr_quiz});
});

router.get('/suggestions', isUser, (req, res) => {
    res.render("dashboard_suggestions", {layout: './dashboard_base', title:"Reading Suggestions"});
});

router.get('/inventory', isUser, (req, res) => {
    res.render("dashboard_inventory",{layout: './dashboard_base', title:"Inventory"});
});

router.get('/profile', isUser, (req, res) => {
    res.render("dashboard_profile",{layout: './dashboard_base', title:"Profile Settings"});
});


router.get('/user-reports',isUser, async (req,res)=>{

    await client.connect();
    //TODO: get username dynamcally
    const user_database = client.db("admin123");
    const response_collection = user_database.collection("responses");
    var resp_data = []
    const all_resp = await response_collection.find({}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "quiz_name":curr_resp.quiz_name,
                "quiz_code":curr_resp.quiz_code,
                "resp_code":curr_resp._id,
                "num_questions":curr_resp.num_questions,
                "correct_resp":curr_resp.correct_resp,
                "incorrect_resp":curr_resp.incorrect_resp,
                "unanswered_resp":curr_resp.unanswered_resp,
                "submit_time":curr_resp.submit_time
            } 
            resp_data.push(curr_resp_data);
         }
    );

    res.render("dashboard_reports",{layout:'./dashboard_base',responses:resp_data,title:"Reports"});
});


module.exports = router;