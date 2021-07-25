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
    organization:{
        type:String,
        required:true
    },
    is_admin:{
        type:Boolean,
        required:true
    },
    verified:{
        type:Boolean,
        required:true
    }
});


UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',UserSchema);
module.exports = User;