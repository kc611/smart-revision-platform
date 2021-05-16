const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email_input' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

                        //Match Password
                // bcrypt.compare(password, user.password, (err,isMatch)=>{
                //     if(err) throw err;

                //     if(isMatch){
                //         return done(null, user);
                //     }else{
                //         return done(null,false,{message:'Incorrect Password'})
                //     }
                // });
                console.log(password);
                console.log(user.password);
                if(password == user.password){
                    console.log("Here1");
                    return done(null, user);
                }else{
                    console.log("Here2");
                    return done(null,false,{message:'Incorrect Password'})
                }
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};