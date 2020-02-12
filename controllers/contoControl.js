let express = require('express');
let router = express.Router();
let passport = require('../config/passportConfig');
let riepilogoService = require('../services/riepilogoService');
let notificheService = require('../services/notificheService');
let documentiService = require('../services/documentiService');
let movimentiService = require('../services/movimentiService');



/* GET home page. */
router.get('/', passport.ensureAuthenticated, function (req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
            notificheService.getNotifiche(req.user.id, (notifiche) => {
                res.render('conto', {title: 'Home', userData: userData, userSettings: userSettings, notifiche: notifiche});
            });
        });
    });
});

/* GET movimenti. */
router.get('/movimenti', passport.ensureAuthenticated, function (req, res, next) {
    let filtro = {
        utente: req.user.id,
        dataInizio: "",
        dataFine: "",
        maggioreDi: 0,
        tipo: 0 // (0-tutti i movimenti, 1-entrate, 2-uscite)
    };
    riepilogoService.getUserData(req.user.id, (userData) => {
        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
            notificheService.getNotifiche(req.user.id, (notifiche) => {
                movimentiService.getMovimenti(filtro, (movimenti) => {
                    res.render('movimenti', {title: 'Movimenti', userData: userData, userSettings: userSettings, notifiche: notifiche, filtro: filtro, movimenti: movimenti});
                });
            });
        });
    });
});

/* POST movimenti. */
router.post('/movimenti', passport.ensureAuthenticated, function (req, res, next) {
    let filtro = {
        utente: req.user.id,
        dataInizio: req.body.dataInizioRicerca,
        dataFine: req.body.dataFineRicerca,
        maggioreDi: req.body.impMinslider,
        tipo: req.body.tipoRicerca // (0-tutti i movimenti, 1-entrate, 2-uscite)
    };
    riepilogoService.getUserData(req.user.id, (userData) => {
        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
            notificheService.getNotifiche(req.user.id, (notifiche) => {
                movimentiService.getMovimenti(filtro, (movimenti) => {
                    res.render('movimenti', {title: 'Movimenti', userData: userData, userSettings: userSettings, notifiche: notifiche, filtro: filtro, movimenti: movimenti});
                });
            });
        });
    });
});

/* GET documenti. */
router.get('/documenti', passport.ensureAuthenticated, function (req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
            notificheService.getNotifiche(req.user.id, (notifiche) => {
                documentiService.getDocumenti(req.user.id, (documenti) => {
                    res.render('documenti', {title: 'Documenti', userData: userData, userSettings: userSettings, notifiche: notifiche, documenti: documenti});
                });
            });
        });
    });
});

/* POST richiesta estratto conto. */
router.post('/richiestaEstrattoConto', passport.ensureAuthenticated, function (req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        let datiEstrattoConto = {
            idUtente: req.user.id,
            nomeUtente: userData.nomeUtente,
            mese: req.body.meseEstrattoConto,
            anno: req.body.annoEstrattoConto
        };
        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
            notificheService.getNotifiche(req.user.id, (notifiche) => {
                documentiService.getDocumenti(req.user.id, (documenti) => {
                    documentiService.richiestaEstrattoConto(datiEstrattoConto, (errorDocumenti) => {
                        if(errorDocumenti) {
                            req.flash('error', errorDocumenti);
                        } else {
                            req.flash('success', 'Estratto conto creato correttamente');
                        }
                        res.render('documenti', {title: 'Documenti', userData: userData, userSettings: userSettings, notifiche: notifiche, documenti: documenti});
                    });
                });
            });
        });
    });
});

/* POST aggiorna Profilo. */
router.post('/aggiornaProfilo', function (req, res, next) {
    if (req.isAuthenticated()) {
        // controllo errori
        riepilogoService.verificaDatiProfilo(req, (errors)=>{
            if(errors){
                errors.forEach(error=>{
                    req.flash('error', error.msg);
                });
                riepilogoService.getUserData(req.user.id, (userData) => {
                    riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                        notificheService.getNotifiche(req.user.id, (notifiche) => {
                            res.render('conto', {title: 'Home', userData: userData, userSettings: userSettings, notifiche: notifiche});
                        });
                    });
                });
            } else {
                try{
                    //flag per non eseguire il blocco di codice nell'if se entra nel catch
                    var erroresave = 0;
                    //oggetto con i dati aggiornati da salvare
                    let agg = {
                        email: req.body.newemail,
                        password: req.body.newpassword,
                        telefono: req.body.newntel,
                        idTelegram: req.body.newidtel,
                        tipo: req.body.tipoprofilo,
                    };
                    if(req.body.tipoprofilo == 0){
                        agg.nome = req.body.newnomeint;
                        agg.cognome = req.body.newcognomeint;
                        agg.cf = req.body.newcf;
                        agg.dataN = autenticazioneService.formattaDataDB(req.body.newdatan);
                    } else {
                        agg.ragSoc = req.body.newragsociale;
                        agg.partitaIva = req.body.newpiva;
                    }
                    //salva i nuovi dati
                    riepilogoService.saveDatiProfilo(agg, req.user.id);
                }catch {
                    riepilogoService.getUserData(req.user.id, (userData) => {
                        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                            notificheService.getNotifiche(req.user.id, (notifiche) => {
                                req.flash('success', 'Informazioni del profilo aggiornate');
                                res.render('conto', {title: 'Home', userData: userData, userSettings: userSettings, notifiche: notifiche});
                            });
                        });
                    });
                    erroresave = 1;
                }
                if(erroresave == 0){
                    riepilogoService.getUserData(req.user.id, (userData) => {
                        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                            notificheService.getNotifiche(req.user.id, (notifiche) => {
                                res.render('conto', {title: 'Home', userData: userData, userSettings: userSettings, notifiche: notifiche});
                            });
                        });
                    });
                }
            }
        });
    } else {
        res.render('login', {title: 'Login'});
    }
});

/* POST aggiorna Impostazioni. */
router.post('/aggiornaImpostazioni', function (req, res, next) {
    if (req.isAuthenticated()) {
        let agg={
            massimaleGiornaliero:req.body.maxgslider,
            sogliaNotificaMovimenti: req.body.notmslider
        };
        if(req.body.maxgswitch == 'on'){
            agg.notificaMassimaleGiornaliero = 1
        } else if(!req.body.maxgswitch){
            agg.notificaMassimaleGiornaliero = 0
        }
        if(req.body.notmswitch == 'on'){
            agg.notificaMovimenti = 1
        } else if(!req.body.notmswitch){
            agg.notificaMovimenti = 0
        }
        riepilogoService.saveImpostazioni(agg, req.user.id);
        riepilogoService.getUserData(req.user.id, (userData) => {
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    res.render('conto', {title: 'Home', userData: userData, userSettings: userSettings, notifiche: notifiche});
                });
            });
        });
    } else {
        res.render('login', {title: 'Login'});
    }
});

module.exports = router;