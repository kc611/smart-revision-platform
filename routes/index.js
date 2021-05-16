var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('base', { title: "Login System" });
});

router.get('/dashboard', (req, res) => {

    res.send("Dashboard");
    
});


module.exports = router;