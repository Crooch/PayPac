let models = require('../models');
let Conto = models.conto;
let Preferenze = models.preferenze;
let ContoPersonale = models.contopersonale;
let ContoAziendale = models.contoaziendale;
let Entrata = models.entrata;
let Uscita = models.uscita;
let ContoCollegato = models.contocollegato;
let CartaCollegata = models.cartacollegata;


// controlla se la mail esiste
function getMail(email) {
    return Conto.findOne({
        attributes: ['mail'],
        where: {
            mail: email
        }
    });
}

module.exports = {

    // recupera la mail dall'id
    mailFromId: function (id) {
        return Conto.findOne({
            attributes: ['mail'],
            where: {
                id: id
            }
        });
    },


    // verifica se la mail è presente nel db
    verificaMail: function (newemail, oldemail, callback) {
        getMail(newemail).then(function(result){
            let error;
            if(newemail != oldemail){
                if (result) {
                    error = {
                        location: 'body',
                        value: 'req.body.regemail',
                        param: "regemail",
                        msg: "Email già registrata, hai dimenticato la password?"
                    };
                }
            }
            callback(error);
        });
    },


    // recupera i dati di riepilogo dell'utente
    getUserData: function (userId, callback) {
            Conto.findOne({
                where: {
                    id: userId
                }
            }).then(function (rowConto){
                ContoPersonale.findOne({
                    where: {
                        refConto: userId
                    }
                }).then(function (rowContoPersonale){
                    ContoAziendale.findOne({
                        where:  {
                            refConto: userId
                        }
                    }).then(function (rowContoAziendale){
                        Entrata.findAll({
                            where: {
                                refConto: userId
                            },
                            order: [ ['data', 'DESC'] ],
                            limit: 3,
                            raw: true
                        }).then(function (rowEntrata){
                            Uscita.findAll({
                                where:  {
                                    refConto: userId
                                },
                                order: [ ['data', 'DESC'] ],
                                limit: 3,
                                raw: true
                            }).then(function (rowUscita){
                                ContoCollegato.findAll({
                                    where: {
                                        refConto: userId
                                    },
                                    raw: true
                                }).then(function (rowContoCollegato){
                                    CartaCollegata.findAll({
                                        where:  {
                                            refConto: userId
                                        },
                                        raw: true
                                    }).then(function (rowCartaCollegata){
                                            // formatta nome utente
                                            let nomeUtenteFormattato;
                                            if(rowConto.tipo == 0) { nomeUtenteFormattato = rowContoPersonale.nomeInt + " " + rowContoPersonale.cognomeInt; }
                                            else { nomeUtenteFormattato = rowContoAziendale.ragioneSociale; }
                                            // crea array ultimi movimenti
                                            let ultimiMovimenti = rowEntrata;
                                            for (let i in rowUscita) {
                                                ultimiMovimenti.push(rowUscita[i]);
                                            }
                                            // oggetto contenente i dati dell'utente
                                            let userData = {
                                                email: rowConto.mail,
                                                telefono: rowConto.telefono,
                                                idTelegram: rowConto.idTelegram,
                                                tipo: rowConto.tipo,
                                                nomeUtente: nomeUtenteFormattato,
                                                iban: rowConto.iban,
                                                saldo: rowConto.saldo,
                                                ultimiMovimenti: ultimiMovimenti,
                                                contiCollegati: rowContoCollegato,
                                                carteCollegate: rowCartaCollegata
                                            };
                                            if(userData.tipo == 0){
                                                userData.nome = rowContoPersonale.nomeInt;
                                                userData.cognome = rowContoPersonale.cognomeInt;
                                                userData.cf = rowContoPersonale.cf;
                                                userData.dataN = rowContoPersonale.dataN;
                                                userData.ragSoc = null;
                                                userData.partitaIva = null;
                                            }
                                            else {
                                                userData.nome = null;
                                                userData.cognome = null;
                                                userData.cf = null;
                                                userData.dataN = null;
                                                userData.ragSoc = rowContoAziendale.ragioneSociale;
                                                userData.partitaIva = rowContoAziendale.pIva;
                                            }
                                            callback(userData);
                                    });
                                });
                            });
                        });
                    });
                });
            });
    },


    // recupera le preferenze dell'utente
    getUserSettings: function (userId, callback) {
        Preferenze.findAll({
            where: {
                refConto: userId
            },
            plain: true
        }).then(function (rowPreferenze) {
            let notificaMassimaleGiornaliero = false;
            let notificaMovimenti = false;
            if(rowPreferenze.notificaMassimaleGiornaliero){
                notificaMassimaleGiornaliero = true;
            }
            if(rowPreferenze.notificaMovimenti){
                notificaMovimenti = true;
            }
            // oggetto contenente le preferenze dell'utente
            let userSettings = {
                pagamentoPreferito: rowPreferenze.pagamentoPreferito,
                massimaleGiornaliero: rowPreferenze.massimaleGiornaliero,
                notificaMassimaleGiornaliero: notificaMassimaleGiornaliero,
                notificaMovimenti: notificaMovimenti,
                sogliaNotificaMovimenti: rowPreferenze.sogliaNotificaMovimenti
            };
            callback(userSettings);
        });
    },


    // salva i dati aggiornati del profilo nel db
    saveDatiProfilo: function (agg, id) {
        // inizio transazione
        models.sequelize.transaction((transaction) => {
            return Promise.all([
                Conto.update({
                    mail: agg.email,
                    password: agg.password,
                    telefono: agg.telefono,
                    idTelegram: agg.idTelegram,
                },{
                    where: {
                        id: id
                    }
                }, { transaction }),

                agg.tipo == 0
                    ? ContoPersonale.update({
                        nomeInt: agg.nome,
                        cognomeInt: agg.cognome,
                        dataN: agg.dataN,
                        cf: agg.cf,
                    },{
                        where: {
                            refConto: id
                        }
                    }, { transaction })
                    : ContoAziendale.update({
                        pIva: agg.partitaIva,
                        ragioneSociale: agg.ragSoc,
                    },{
                        where: {
                            refConto: id
                        }
                    }, { transaction })
            ]);

            // se il codice esegue fino a qui effettua un auto-commit
            // se si verifica un errore esegue un rollback

        })
            .then(() => {
                console.log('queries ran successfully');
            })
            .catch((err) => {
                console.log('queries failed', err);
            });
    },


    saveImpostazioni: function (agg, id) {
        Preferenze.update({
            notificaMassimaleGiornaliero: agg.notificaMassimaleGiornaliero,
            massimaleGiornaliero: agg.massimaleGiornaliero,
            notificaMovimenti: agg.notificaMovimenti,
            sogliaNotificaMovimenti: agg.sogliaNotificaMovimenti,
        },{
        where: {
                refConto: id
            }
        })
            .then(() => {
                console.log('queries ran successfully');
            })
            .catch((err) => {
                console.log('queries failed', err);
            });
    }

};