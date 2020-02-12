let express = require('express');
let router = express.Router();
let passport = require('passport');
let autenticazioneService = require('../services/autenticazioneService');
let riepilogoService = require('../services/riepilogoService');


/* GET root. */
router.get('/', function(req, res, next) {
	if(req.isAuthenticated()){
		riepilogoService.getUserData(req.user.id, (userData) => {
			riepilogoService.getUserSettings(req.user.id, (userSettings) => {
				notificheService.getNotifiche(req.user.id, (notifiche) => {
					res.render('conto', {title: 'Home', userData: userData, userSettings: userSettings, notifiche: notifiche});
				});
			});
		});
	}
	else{
		res.render('login', { title: 'Login' });
	}
});

/* GET login. */
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login' });
});

/* GET logout. */
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Hai eseguito il Logout');
	res.redirect('/login');
});

/* POST registrazione. */
router.post('/registrazione', function (req, res, next) {
	autenticazioneService.criptaPassword(req.body.regpassword, (hash)=>{
		let reg = {
			email: req.body.regemail,
			password: hash,
			confermapassword: hash,
			telefono: req.body.regntel,
			telegram: req.body.regidtel,
			nome: req.body.regnomeint,
			cognome: req.body.regcognomeint,
			cf: req.body.regcf,
			datan: autenticazioneService.formattaDataDB(req.body.regdatan),
			ragsoc: req.body.regragsociale,
			piva: req.body.regpiva,
			tipo: req.body.regtabattiva
		};

		// controllo errori
		autenticazioneService.verifica(req, (errors)=>{
			if(errors){
				errors.forEach(error=>{
					req.flash('error', error.msg);
				})
				res.location('/login');
				res.redirect('/login');
			} else {
				try{
					//flag per non eseguire il blocco di codice nell'if se entra nel catch
					var erroresave = 0;
					autenticazioneService.save(reg, 0);
				}catch {
					req.flash('error', 'Errore nella registrazione, riprovare');
					res.location('/login');
					res.redirect('/login');
					erroresave = 1;
				}
				if(erroresave == 0){
					req.flash('success', 'Adesso sei registrato e puoi eseguire il login');
					res.location('/login');
					res.redirect('/login');
				}
			}
		});
	});
});

/*  POST login.  */
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/login', failureFlash: 'Errore Login'}),
  function(req, res) {
	  res.redirect('./conto/');
});

module.exports = router;