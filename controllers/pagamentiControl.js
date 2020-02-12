let express = require('express');
let router = express.Router();
let passport = require('../config/passportConfig');
let riepilogoService = require('../services/riepilogoService');
let notificheService = require('../services/notificheService');
let pagamentiService = require('../services/pagamentiService');


/* GET pagamenti. */
router.get('/', passport.ensureAuthenticated, function(req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        riepilogoService.getUserSettings(req.user.id, (userSettings) => {
            notificheService.getNotifiche(req.user.id, (notifiche) => {
                pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                    res.render('pagamenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti
                    });
                });
            });
        });
    });
});

/* POST bonifico. */
router.post('/bonifico', passport.ensureAuthenticated, function(req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        let datiBonifico = {
            idMittente: req.user.id,
            nomeMittente: userData.nomeUtente,
            metodoPagamento: req.body.pagamentoBonifico,
            iban: req.body.ibanBonifico,
            nomeIntestatario: req.body.nomeBonifico,
            causale: req.body.causaleBonifico,
            importo: req.body.importoBonifico
        };
        pagamentiService.effettuaBonifico(datiBonifico, errorBonifico =>{
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                        if(errorBonifico){
                            req.flash('error', errorBonifico);
                        } else {
                            req.flash('success', 'Bonifico effettuato correttamente');
                        }
                        res.render('pagamenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti});
                    });
                });
            });
        });
    });
});

/* POST ricarica conto. */
router.post('/ricaricaConto', passport.ensureAuthenticated, function(req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        let datiRicarica = {
            idMittente: req.user.id,
            nomeMittente: userData.nomeUtente,
            metodoPagamento: req.body.pagamentoRicarica,
            iban: userData.iban,
            causale: "Ricarica conto",
            importo: req.body.importoRicarica
        };
        pagamentiService.effettuaRicarica(datiRicarica, errorRicarica =>{
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                        if(errorRicarica){
                            req.flash('error', errorRicarica);
                        } else {
                            req.flash('success', 'Ricarica effettuata correttamente');
                        }
                        res.render('pagamenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti});
                    });
                });
            });
        });
    });
});

/* POST aggiungi pagamento periodico. */
router.post('/aggiungiPeriodico', passport.ensureAuthenticated, function(req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        let datiPeriodico = {
            idMittente: req.user.id,
            nomeMittente: userData.nomeUtente,
            nomeDestinatario: req.body.nomePeriodico,
            metodoPagamento: req.body.pagamentoPeriodico,
            importo: req.body.importoPeriodico,
            cadenza: req.body.cadenzaPeriodico
        };
        pagamentiService.aggiungiPeriodico(datiPeriodico, (errorPeriodico) => {
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                        if(errorPeriodico){
                            req.flash('error', errorPeriodico);
                        } else {
                            req.flash('success', 'Pagamento periodico effettuato correttamente');
                        }
                        res.render('pagamenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti});
                    });
                });
            });
        });
    });
});

/* POST elimina pagamento periodico. */
router.post('/eliminaPeriodico', passport.ensureAuthenticated, function(req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        pagamentiService.eliminaPeriodico(req.body.btn_eliminaPeriodico, (errorEliminaPeriodico) => {
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                        if(errorEliminaPeriodico) {
                            req.flash('error', errorEliminaPeriodico);
                        } else {
                            req.flash('success', 'Pagamento periodico eliminato correttamente');
                        }
                        res.render('pagamenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti});

                    });
                });
            });
        });
    });
});

/* POST crea link di pagamento. */
router.post('/creaLink', passport.ensureAuthenticated, function(req, res, next) {
    let datiLink ={
        idMittente : req.user.id,
        destinatario: req.body.nomeLinkInvio,
        importo: req.body.importoLinkInvio,
        tipo: req.body.btn_Link
    };
    riepilogoService.getUserData(req.user.id, (userData) => {
        pagamentiService.creaLink(datiLink,(errorLink) => {
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                        if(errorLink) {
                            req.flash('error', errorLink);
                        } else {
                            req.flash('success', 'Link di pagamento creato correttamente');
                        }
                        res.render('pagamenti#pendenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti});
                    });
                });
            });
        });
    });
});

/* POST elimina link di pagamento. */
router.post('/eliminaLink', passport.ensureAuthenticated, function(req, res, next) {
    riepilogoService.getUserData(req.user.id, (userData) => {
        pagamentiService.eliminaLink(req.body.btn_eliminalink,(errorLink) => {
            riepilogoService.getUserSettings(req.user.id, (userSettings) => {
                notificheService.getNotifiche(req.user.id, (notifiche) => {
                    pagamentiService.getPagamenti(req.user.id, (pagamenti) => {
                        if(errorLink) {
                            req.flash('error', errorLink);
                        } else {
                            req.flash('success', 'Link di pagamento eliminato correttamente');
                        }
                        res.render('pagamenti#pendenti', {title: 'Invia/Ricevi Denaro', userData: userData, userSettings: userSettings, notifiche: notifiche, pagamenti: pagamenti});
                    });
                });
            });
        });
    });
});

module.exports = router;