var express = require('express');
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });
const utils = require('./utils')

router.get('/', utils.to_dashboard_if_user, (req, res) => {
    res.render('landing_page/landing_page');
});


router.get('/dashboard', utils.continue_if_user, (req, res) => {
    res.redirect("quizzes")
});

router.get('/quizzes', utils.continue_if_user, async (req,res)=>{
    await client.connect();

    const user_database = client.db(req.user.username);
    const org_database = client.db(req.user.organization.replace(" ",""));
    const quiz_collection = user_database.collection("quizzes");
    var past_built_quiz = []

    await quiz_collection.find().forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "quiz_name":curr_resp.quiz_name,
                "quiz_code":curr_resp._id,
                "num_questions":curr_resp.num_questions,
                "subject":curr_resp.subject,
                "quiz_time":curr_resp.quiz_time
            } 
            past_built_quiz.push(curr_resp_data);
        }
    );

    const subject_collection = org_database.collection("subjects");

    var subject_data = []
    var code_to_subj = {}

    await subject_collection.find({}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "subject_name":curr_resp.subject_name,
                "subject_code":curr_resp.subject_code
            } 
            code_to_subj[curr_resp.subject_code] = curr_resp.subject_name;
            subject_data.push(curr_resp_data);
        }
    );
    
    res.render("dashboard_quizzes",{layout:'./dashboard_base',title:"Quizzes",past_built_quiz:past_built_quiz.slice(-3),subject_data:subject_data,code_to_subj:code_to_subj});
});

router.get('/reports', utils.continue_if_user, async (req,res)=>{
    const response_code = req.query.response_code;

    await client.connect();

    const user_database = client.db(req.user.username);
    const response_collection = user_database.collection("responses");
    const quiz_collection = user_database.collection("quizzes");
    
    const curr_response = await response_collection.findOne({_id:new mongo.ObjectID(response_code)});
    const curr_quiz = await quiz_collection.findOne({_id:new mongo.ObjectID(curr_response['quiz_code'])});

    var all_built = true;

    for(i=0;i<curr_quiz['num_questions'];i++){
        if(curr_response['report_reqs'][i]=="0"){
            all_built = false;
        }
    }

    var curr_info = {
        "all_built": all_built,
        "response_code":response_code
    }

    res.render("reports_main",{layout:'./reports_layout',title:"Report on "+curr_quiz.quiz_name,curr_response:curr_response,curr_quiz:curr_quiz,curr_info:curr_info});
});

router.get('/suggestions', utils.continue_if_user, async (req, res) => {

    await client.connect();

    const user_database = client.db(req.user.username);
    const quiz_collection = user_database.collection("quizzes");

    var resp_data = []

    const curr_quiz = await quiz_collection.find({'show_in_suggestions':true}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "quiz_name":curr_resp.quiz_name,
                "quiz_code":curr_resp._id,
                "num_questions":curr_resp.num_questions,
                "subject":curr_resp.subject,
            } 
            resp_data.push(curr_resp_data);
        }
    );
    
    res.render("dashboard_suggestions", {layout: './dashboard_base', title:"Reading Suggestions", suggestions:resp_data});
});

router.get('/suggestions/view', utils.continue_if_user, async (req, res) => {

    await client.connect();

    const user_database = client.db(req.user.username);
    const quiz_collection = user_database.collection("quizzes");

    var resp_data = []

    const curr_quiz = await quiz_collection.find({'show_in_suggestions':true}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "quiz_name":curr_resp.quiz_name,
                "quiz_code":curr_resp._id,
                "num_questions":curr_resp.num_questions,
                "subject":curr_resp.subject,
            } 
            resp_data.push(curr_resp_data);
        }
    );
    
    res.render("dashboard_suggestions", {layout: './dashboard_base', title:"Reading Suggestions", suggestions:resp_data});
});


router.get('/inventory', utils.continue_if_user, async (req, res) => {
    await client.connect();

    const user_database = client.db(req.user.organization.replace(" ",""));
    const quiz_collection = user_database.collection("subjects");

    var resp_data = []

    await quiz_collection.find({}).forEach(
        function(curr_resp) { 
            var curr_resp_data = {
                "subject_name":curr_resp.subject_name,
                "subject_code":curr_resp.subject_code
            } 
            resp_data.push(curr_resp_data);
        }
    );
    


    res.render("dashboard_inventory",{layout: './dashboard_base', title:"Inventory", resp_data:resp_data});
});

router.get('/profile', utils.continue_if_user, (req, res) => {
    res.render("dashboard_profile",{layout: './dashboard_base', title:"Profile Settings"});
});


router.get('/user-reports',utils.continue_if_user, async (req,res)=>{

    await client.connect();

    const user_database = client.db(req.user.username);
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