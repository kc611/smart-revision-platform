var express = require('express');
var router = express.Router();
const querystring = require("querystring");
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });

router.get('/', (req, res) => {
    res.render('landing_page');
});

router.get('/dashboard', (req, res) => {
    res.render("dashboard_main",{layout: './dashboard_base'});
});

router.get('/quizzes',(req,res)=>{
    res.render("dashboard_quizzes",{layout:'./dashboard_base'});
})

router.get('/user-reports',async (req,res)=>{

    await client.connect();
    //TODO: get username dynamcally
    const user_database = client.db("admin123");
    const quiz_collection = user_database.collection("responses");

    const all_resp = quiz_collection.find({});

    var resp_data = []

    for (curr_resp in all_resp){
        var curr_resp_data = {
            "quiz_code":curr_resp.quiz_code,
            "resp_code":curr_resp._id,
            "total_points":curr_resp.total_points,
            "max_points":curr_resp.max_points,
            "submit_time":curr_resp.submit_time
        } 
    }

    res.render("dashboard_reports",{layout:'./dashboard_base',responses:resp_data});
})

module.exports = router;