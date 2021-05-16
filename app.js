const express = require('express');
const session = require('express-session');
const path = require('path');
var favicon = require('serve-favicon');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const db = require('./config/keys').MongoURI;
const passport = require('passport');

const app = express();

require('./config/passport')(passport);

const PORT = process.env.PORT || 3000


mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>console.log('MongoDB Connected'))
    .catch(err=>console.log(err));


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:false}));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use(session({ 
    secret: 'secret',
    resave: true, 
    saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use("/",require('./routes/index'));
app.use("/users",require('./routes/users'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.get("*", (req, res) => {
    console.log(`Tried accessing ${req.url}`);
    res.send("404");
});

app.listen(PORT, () => {
    console.log(`Serving app on port ${PORT}`);
    console.log(`Link: http://localhost:${PORT}`)
});