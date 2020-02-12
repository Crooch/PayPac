let bcrypt = require('bcryptjs');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let models = require('../models');
let Conto = models.conto;

/*  CONFIGURAZIONE PASSPORT  */

// serializza l'utente per la sessione
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// deserializza l'utente
passport.deserializeUser(function(id, done) {
    Conto.findAll({
        attributes: ['id'],
        where: {
            id: id
        }
    }).then((results) => {
        done(null, results[0]);
    }).catch(err => {
        throw new Error(err);
    });
});

passport.use(new LocalStrategy({
        // di default la strategia locale utilizza nome utente e password, sostituiremo con la posta elettronica
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // ci consente di restituire l'intera richiesta alla callback
    },
    function(req, email, password, done) {
        Conto.findAll({
            where: {
                mail: email
            }
        }).then((results) => {
            if (!results.length) {
                return done(null, false, req.flash('loginMessage', 'Utente non trovato')); // req.flash is the way to set flashdata using connect-flash
            }
            bcrypt.compare(password, results[0].password, function(err, isMatch) {
                if (err) {
                    return done(err);
                }
                if(!isMatch){
                    // if the user is found but the password is wrong
                    return done(null, false, req.flash('loginMessage', 'Oops! password sbagliata')); // create the loginMessage and save it to session as flashdata
                }
                if (isMatch) {
                    // all is well, return successful user
                    return done(null, results[0]);
                }
            });
        }).catch(err => {
            throw new Error(err);
        });
    }));


module.exports = {
    // controlla se è stato effettuato il login
    ensureAuthenticated: function (req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/login');
    }
}