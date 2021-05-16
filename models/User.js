const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String
    },
});


UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',UserSchema);
module.exports = User;