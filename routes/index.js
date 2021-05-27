var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('landing_page');
});

router.get('/dashboard', (req, res) => {
    res.render("dashboard_main",{layout: './dashboard_base'});
});

router.get('/quizzes',(req,res)=>{
    res.render("dashboard_quizzes",{layout:'./dashboard_base'});
})
module.exports = router;