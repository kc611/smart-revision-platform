const express = require('express')
const path = require('path')
const bodyparser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const router = require('./router')

const app = express();

const PORT = process.env.PORT || 3000



app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({ 
    secret: uuidv4(), 
    resave: false, 
    saveUninitialized: true 
}));

app.use("/route",router);

app.get('/', (req, res) => {
    res.render('base', { title: "Login System" });
});
app.get("*", (req, res) => res.render("404"));

app.listen(PORT, () => {
    console.log(`Serving app on port ${PORT}`);
    console.log(`Link: http://localhost:${PORT}`)
});