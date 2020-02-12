const {Op} = require("sequelize");
let models = require('../models');
let Conto = models.conto;
let Preferenze = models.preferenze;
let Entrata = models.entrata;
let Uscita = models.uscita;
let ContoBanca = models.contobanca;
let CartaBanca = models.cartabanca;
let Notifica = models.notifica;
let PagamentoPeriodico = models.pagamentoperiodico;
let RichiestaPendente = models.richiestapendente;
let ContoAziendale = models.contoaziendale;



// associazone per join
ContoAziendale.hasMany(PagamentoPeriodico, {foreignKey: 'refContoDest', sourceKey: 'id'});
PagamentoPeriodico.belongsTo(ContoAziendale, {foreignKey: 'refContoDest', targetKey: 'id'});

// funzione che aggiunge giorni alla data
Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

// funzione che effettua il bonifico
const bonifico = function (datiBonifico, callback) {
    let errorBonifico = '';
    let dataOdierna = new Date;
    //imposta la data odierna da oggi 00:00:00 a domani 00:00:00
    let OggiInizio = new Date(dataOdierna.getFullYear(), dataOdierna.getMonth(), dataOdierna.getDate());
    dataOdierna = dataOdierna.addDays(1);
    let OggiFine = new Date(dataOdierna.getFullYear(), dataOdierna.getMonth(), dataOdierna.getDate());
    Uscita.findAll({
        where: {
            data: {
                [Op.between]: [OggiInizio, OggiFine]
            },
            refConto: datiBonifico.idMittente,
        },
        raw: true
    }).then(function (rowUsciteOdierne) {
        Preferenze.findOne({
            where: {
                refConto: datiBonifico.idMittente
            },
        }).then(function (rowPreferenze) {
            let totaleUsciteOdierne = 0;
            for(let i in rowUsciteOdierne){
                totaleUsciteOdierne = totaleUsciteOdierne + parseFloat(rowUsciteOdierne[i].importo+"");
            }
            totaleUsciteOdierne = totaleUsciteOdierne * (-1);
            if (totaleUsciteOdierne <= parseFloat(rowPreferenze.massimaleGiornaliero+"")) {
                // trova dati conto mittente
                Conto.findOne({
                    where: {
                        id: datiBonifico.idMittente,
                        iban: datiBonifico.metodoPagamento
                    }
                }).then(function (rowContoMittent) {
                    ContoBanca.findOne({
                        where: {
                            iban: datiBonifico.metodoPagamento
                        }
                    }).then(function (rowContoCollegatoMittent) {
                        CartaBanca.findOne({
                            where: {
                                pan: datiBonifico.metodoPagamento
                            }
                        }).then(function (rowCartaCollegatoMittent) {
                            // controllo con quale metodo è stato effettuato il pagamento

                            // se è stato effettuato con il conto paypac
                            if(rowContoMittent){
                                // trova dati conto del destinatario (se è registrato)
                                Conto.findOne({
                                    where: {
                                        iban: datiBonifico.iban
                                    }
                                }).then(function (rowContoDestinatario) {
                                    // inizio transazione, verifica le disponibilità ed effettua il bonifico
                                    models.sequelize.transaction((transaction) => {
                                        return Promise.all([
                                            parseFloat(rowContoMittent.saldo+"") >= (parseFloat(datiBonifico.importo+"") + 2)
                                                ? (Conto.update({
                                                        saldo: parseFloat(rowContoMittent.saldo+"") - (parseFloat(datiBonifico.importo+"") + 2)
                                                    }, {
                                                        where: {
                                                            id: datiBonifico.idMittente
                                                        }
                                                    }, {transaction}),
                                                        // inserisci i dati nelle uscite
                                                        Uscita.create({
                                                            importo: (parseFloat(datiBonifico.importo+"") + 2) * (-1),
                                                            descrizione: datiBonifico.causale,
                                                            nomeDest: datiBonifico.nomeIntestatario,
                                                            iban: datiBonifico.iban,
                                                            metodoPagamento: datiBonifico.metodoPagamento,
                                                            refConto: datiBonifico.idMittente
                                                        }, { transaction })
                                                ) : (errorBonifico = 'Disponibilità sul metodo di pagamento selezionato insufficente',
                                                    callback(errorBonifico)),
                                            // se il conto del destinatario è registrato su paypac aggiorno il conto
                                            rowContoDestinatario
                                                ? (Conto.update({
                                                        saldo: parseFloat(rowContoDestinatario.saldo+"") + parseFloat(datiBonifico.importo+"")
                                                    }, {
                                                        where: {
                                                            id: rowContoDestinatario.id
                                                        }
                                                    }, {transaction}),
                                                        // inserisci i dati nelle entrate
                                                        Entrata.create({
                                                            importo: datiBonifico.importo,
                                                            descrizione: datiBonifico.causale,
                                                            nomeMitt: datiBonifico.nomeMittente,
                                                            refConto: rowContoDestinatario.id
                                                        }, { transaction })
                                                ) : (errorBonifico = '')
                                        ]);

                                        // se il codice esegue fino a qui effettua un auto-commit
                                        // se si verifica un errore esegue un rollback

                                    })
                                        .then(() => {
                                            if(rowPreferenze.notificaMovimenti == 1 && parseFloat(datiBonifico.importo+"") >= parseFloat(rowPreferenze.sogliaNotificaMovimenti+"")){
                                                Notifica.create({
                                                    descrizione: 'Effettuato movimento di:'+datiBonifico.importo+'€ verso '+datiBonifico.iban,
                                                    refConto: datiBonifico.idMittente
                                                });
                                            }
                                            callback(errorBonifico);
                                        })
                                        .catch((err) => {
                                            errorBonifico = 'Errore: ' + err;
                                            callback(errorBonifico);
                                        });
                                });

                                //se è stato effettuato con un conto o una carta collegata
                            } else if(rowContoCollegatoMittent){
                                // trova dati conto del destinatario (se è registrato)
                                Conto.findOne({
                                    where: {
                                        iban: datiBonifico.iban
                                    }
                                }).then(function (rowContoDestinatario) {
                                    // inizio transazione, verifica le disponibilità ed effettua il bonifico
                                    models.sequelize.transaction((transaction) => {
                                        return Promise.all([
                                            parseFloat(rowContoCollegatoMittent.saldo+"") >= (parseFloat(datiBonifico.importo+"") + 2)
                                                ? (ContoBanca.update({
                                                        saldo: parseFloat(rowContoCollegatoMittent.saldo+"") - (parseFloat(datiBonifico.importo+"") + 2)
                                                    }, {
                                                        where: {
                                                            iban: rowContoCollegatoMittent.iban
                                                        }
                                                    }, {transaction}),
                                                        // inserisci i dati nelle uscite
                                                        Uscita.create({
                                                            importo: (parseFloat(datiBonifico.importo+"") + 2) * (-1),
                                                            descrizione: datiBonifico.causale,
                                                            nomeDest: datiBonifico.nomeIntestatario,
                                                            iban: datiBonifico.iban,
                                                            metodoPagamento: datiBonifico.metodoPagamento,
                                                            refConto: datiBonifico.idMittente
                                                        }, { transaction })
                                                ) : (errorBonifico = 'Disponibilità sul metodo di pagamento selezionato insufficente',
                                                    callback(errorBonifico)),
                                            // se il conto del destinatario è registrato su paypac aggiorno il conto
                                            rowContoDestinatario
                                                ? (Conto.update({
                                                        saldo: parseFloat(rowContoDestinatario.saldo+"") + parseFloat(datiBonifico.importo+"")
                                                    }, {
                                                        where: {
                                                            id: rowContoDestinatario.id
                                                        }
                                                    }, {transaction}),
                                                        // inserisci i dati nelle entrate
                                                        Entrata.create({
                                                            importo: datiBonifico.importo,
                                                            descrizione: datiBonifico.causale,
                                                            nomeMitt: datiBonifico.nomeMittente,
                                                            refConto: rowContoDestinatario.id
                                                        }, { transaction })
                                                ) : (errorBonifico = '')
                                        ]);

                                        // se il codice esegue fino a qui effettua un auto-commit
                                        // se si verifica un errore esegue un rollback

                                    })
                                        .then(() => {
                                            if(rowPreferenze.notificaMovimenti == 1 && parseFloat(datiBonifico.importo+"") >= parseFloat(rowPreferenze.sogliaNotificaMovimenti+"")){
                                                Notifica.create({
                                                    descrizione: 'Effettuato movimento di:'+datiBonifico.importo+'€ verso '+datiBonifico.iban,
                                                    refConto: datiBonifico.idMittente
                                                });
                                            }
                                            callback(errorBonifico);
                                        })
                                        .catch((err) => {
                                            errorBonifico = 'Errore: ' + err;
                                            callback(errorBonifico);
                                        });
                                });

                            } else if(rowCartaCollegatoMittent){
                                // trova dati conto del destinatario (se è registrato)
                                Conto.findOne({
                                    where: {
                                        iban: datiBonifico.iban
                                    }
                                }).then(function (rowContoDestinatario) {
                                    // inizio transazione, verifica le disponibilità ed effettua il bonifico
                                    models.sequelize.transaction((transaction) => {
                                        return Promise.all([
                                            parseFloat(rowCartaCollegatoMittent.saldo+"") >= (parseFloat(datiBonifico.importo+"") + 2)
                                                ? (CartaBanca.update({
                                                        saldo: parseFloat(rowCartaCollegatoMittent.saldo+"") - (parseFloat(datiBonifico.importo+"") + 2)
                                                    }, {
                                                        where: {
                                                            pan: rowCartaCollegatoMittent.pan
                                                        }
                                                    }, {transaction}),
                                                        // inserisci i dati nelle uscite
                                                        Uscita.create({
                                                            importo: (parseFloat(datiBonifico.importo+"") + 2) * (-1),
                                                            descrizione: datiBonifico.causale,
                                                            nomeDest: datiBonifico.nomeIntestatario,
                                                            iban: datiBonifico.iban,
                                                            metodoPagamento: datiBonifico.metodoPagamento,
                                                            refConto: datiBonifico.idMittente
                                                        }, { transaction })
                                                ) : (errorBonifico = 'Disponibilità sul metodo di pagamento selezionato insufficente',
                                                    callback(errorBonifico)),
                                            // se il conto del destinatario è registrato su paypac aggiorno il conto
                                            rowContoDestinatario
                                                ? (Conto.update({
                                                        saldo: parseFloat(rowContoDestinatario.saldo+"") + parseFloat(datiBonifico.importo+"")
                                                    }, {
                                                        where: {
                                                            id: rowContoDestinatario.id
                                                        }
                                                    }, {transaction}),
                                                        // inserisci i dati nelle entrate
                                                        Entrata.create({
                                                            importo: datiBonifico.importo,
                                                            descrizione: datiBonifico.causale,
                                                            nomeMitt: datiBonifico.nomeMittente,
                                                            refConto: rowContoDestinatario.id
                                                        }, { transaction })
                                                ) : (errorBonifico = '')
                                        ]);

                                        // se il codice esegue fino a qui effettua un auto-commit
                                        // se si verifica un errore esegue un rollback

                                    })
                                        .then(() => {
                                            if(rowPreferenze.notificaMovimenti == 1 && parseFloat(datiBonifico.importo+"") >= parseFloat(rowPreferenze.sogliaNotificaMovimenti+"")){
                                                Notifica.create({
                                                    descrizione: 'Effettuato movimento di:'+datiBonifico.importo+'€ verso '+datiBonifico.iban,
                                                    refConto: datiBonifico.idMittente
                                                });
                                            }
                                            callback(errorBonifico);
                                        })
                                        .catch((err) => {
                                            errorBonifico = 'Errore: ' + err;
                                            callback(errorBonifico);
                                        });
                                });

                                //se c'è stato un errore nell'inserimento del conto
                            } else {
                                errorBonifico = 'Errore nella selezione del metodo di pagamento';
                                callback(errorBonifico);
                            }
                        });
                    });
                });
            } else {
                errorBonifico = 'Superamento massimale giornaliero, aumenta il massimale dalle impostazioni o riprova domani';
                if(Preferenze.notificaMassimaleGiornaliero == 1){
                    Notifica.create({
                        descrizione: 'Tentativo di superamento massimale giornaliero',
                        refConto: datiBonifico.idMittente
                    });
                }
                callback(errorBonifico);
            }
        });
    });
};

module.exports = {

    // salva id dati del bonifico nel db
    effettuaBonifico: function (datiBonifico, callback) {
        bonifico(datiBonifico, (errorBonifico) => {
            callback(errorBonifico);
        });
    },

    // salva id dati della ricarica nel db
    effettuaRicarica: function (datiRicarica, callback) {
        let errorRicarica = '';
        let dataOdierna = new Date;
        //imposta la data odierna da oggi 00:00:00 a domani 00:00:00
        let OggiInizio = new Date(dataOdierna.getFullYear(), dataOdierna.getMonth(), dataOdierna.getDate());
        dataOdierna = dataOdierna.addDays(1);
        let OggiFine = new Date(dataOdierna.getFullYear(), dataOdierna.getMonth(), dataOdierna.getDate());
        Uscita.findAll({
            where: {
                data: {
                    [Op.between]: [OggiInizio, OggiFine]
                },
                refConto: datiRicarica.idMittente
            }
        }).then(function (rowUsciteOdierne) {
            Preferenze.findOne({
                where: {
                    refConto: datiRicarica.idMittente
                }
            }).then(function (rowPreferenze) {
                let totaleUsciteOdierne = 0;
                for(let i in rowUsciteOdierne){
                    totaleUsciteOdierne = totaleUsciteOdierne + parseFloat(rowUsciteOdierne[i].importo+"");
                }
                totaleUsciteOdierne = totaleUsciteOdierne * (-1);
                if (totaleUsciteOdierne <= parseFloat(rowPreferenze.massimaleGiornaliero+"")) {
                    // trova dati conto mittente
                    ContoBanca.findOne({
                            where: {
                                iban: datiRicarica.metodoPagamento
                            }
                        }).then(function (rowContoCollegatoMittent) {
                            CartaBanca.findOne({
                                where: {
                                    pan: datiRicarica.metodoPagamento
                                }
                            }).then(function (rowCartaCollegatoMittent) {
                                // controllo con quale metodo è stato effettuato il pagamento

                                //se è stato effettuato con un conto o una carta collegata
                                if(rowContoCollegatoMittent){
                                    let arrayNome = datiRicarica.nomeMittente.split(" ");
                                    if(arrayNome[0] == rowContoCollegatoMittent.nomeInt && arrayNome[1] == rowContoCollegatoMittent.cognomeInt) {
                                        // trova dati conto del destinatario (= mittente)
                                        Conto.findOne({
                                            where: {
                                                iban: datiRicarica.iban
                                            }
                                        }).then(function (rowContoDestinatario) {
                                            // inizio transazione, verifica le disponibilità ed effettua il bonifico
                                            models.sequelize.transaction((transaction) => {
                                                return Promise.all([
                                                    parseFloat(rowContoCollegatoMittent.saldo+"") >= parseFloat(datiRicarica.importo+"")
                                                        ? (ContoBanca.update({
                                                                saldo: parseFloat(rowContoCollegatoMittent.saldo+"") - parseFloat(datiRicarica.importo+"")
                                                            }, {
                                                                where: {
                                                                    iban: rowContoCollegatoMittent.iban
                                                                }
                                                            }, {transaction}),
                                                                // inserisci i dati nelle uscite
                                                                Uscita.create({
                                                                    importo: parseFloat(datiRicarica.importo+"") * (-1),
                                                                    descrizione: datiRicarica.causale,
                                                                    nomeDest: datiRicarica.nomeMittente,
                                                                    iban: datiRicarica.iban,
                                                                    metodoPagamento: datiRicarica.metodoPagamento,
                                                                    refConto: datiRicarica.idMittente
                                                                }, {transaction})
                                                        ) : (errorRicarica = 'Disponibilità sul metodo di pagamento selezionato insufficente',
                                                            callback(errorRicarica)),
                                                    // se il conto del destinatario è registrato su paypac aggiorno il conto
                                                    rowContoDestinatario
                                                        ? (Conto.update({
                                                                saldo: parseFloat(rowContoDestinatario.saldo+"") + parseFloat(datiRicarica.importo+"")
                                                            }, {
                                                                where: {
                                                                    id: datiRicarica.idMittente
                                                                }
                                                            }, {transaction}),
                                                                // inserisci i dati nelle entrate
                                                                Entrata.create({
                                                                    importo: datiRicarica.importo,
                                                                    descrizione: datiRicarica.causale,
                                                                    nomeMitt: datiRicarica.nomeMittente,
                                                                    refConto: datiRicarica.idMittente
                                                                }, {transaction})
                                                        ) : (errorRicarica = 'Errore nel caricamento, riprovare',
                                                            callback(errorRicarica))
                                                ]);

                                                // se il codice esegue fino a qui effettua un auto-commit
                                                // se si verifica un errore esegue un rollback

                                            })
                                                .then(() => {
                                                    if (rowPreferenze.notificaMovimenti == 1 && parseFloat(datiRicarica.importo+"") >= parseFloat(rowPreferenze.sogliaNotificaMovimenti+"")) {
                                                        Notifica.create({
                                                            descrizione: 'Effettuata ricarica di :'+datiRicarica.importo+'€',
                                                            refConto: datiRicarica.idMittente
                                                        });
                                                    }
                                                    callback(errorRicarica);
                                                })
                                                .catch((err) => {
                                                    errorRicarica = 'Errore: ' + err;
                                                    callback(errorRicarica);
                                                });
                                        });
                                    } else {
                                        errorRicarica = 'Effettua la ricarica con un metodo di pagamento avente lo stesso intestatario del conto PayPac';
                                        callback(errorRicarica);
                                    }
                                } else if(rowCartaCollegatoMittent){
                                    let arrayNome = datiRicarica.nomeMittente.split(" ");
                                    if(arrayNome[0] == rowCartaCollegatoMittent.nomeInt && arrayNome[1] == rowCartaCollegatoMittent.cognomeInt) {
                                        // trova dati conto del destinatario (= mittente)
                                        Conto.findOne({
                                            where: {
                                                iban: datiRicarica.iban
                                            }
                                        }).then(function (rowContoDestinatario) {
                                            // inizio transazione, verifica le disponibilità ed effettua il bonifico
                                            models.sequelize.transaction((transaction) => {
                                                return Promise.all([
                                                    parseFloat(rowCartaCollegatoMittent.saldo+"") >= parseFloat(datiRicarica.importo+"")
                                                        ? (CartaBanca.update({
                                                                saldo: parseFloat(rowCartaCollegatoMittent.saldo+"") - parseFloat(datiRicarica.importo+"")
                                                            }, {
                                                                where: {
                                                                    pan: rowCartaCollegatoMittent.pan
                                                                }
                                                            }, {transaction}),
                                                                // inserisci i dati nelle uscite
                                                                Uscita.create({
                                                                    importo: parseFloat(datiRicarica.importo+"") * (-1),
                                                                    descrizione: datiRicarica.causale,
                                                                    nomeDest: datiRicarica.nomeMittente,
                                                                    iban: datiRicarica.iban,
                                                                    metodoPagamento: datiRicarica.metodoPagamento,
                                                                    refConto: datiRicarica.idMittente
                                                                }, {transaction})
                                                        ) : (errorRicarica = 'Disponibilità sul metodo di pagamento selezionato insufficente',
                                                            callback(errorRicarica)),
                                                    // se il conto del destinatario è registrato su paypac aggiorno il conto
                                                    rowContoDestinatario
                                                        ? (Conto.update({
                                                                saldo: parseFloat(rowContoDestinatario.saldo+"") + parseFloat(datiRicarica.importo+"")
                                                            }, {
                                                                where: {
                                                                    id: datiRicarica.idMittente
                                                                }
                                                            }, {transaction}),
                                                                // inserisci i dati nelle entrate
                                                                Entrata.create({
                                                                    importo: datiRicarica.importo,
                                                                    descrizione: datiRicarica.causale,
                                                                    nomeMitt: datiRicarica.nomeMittente,
                                                                    refConto: datiRicarica.idMittente
                                                                }, {transaction})
                                                        ) : (errorRicarica = 'Errore nel caricamento, riprovare',
                                                            callback(errorRicarica))
                                                ]);

                                                // se il codice esegue fino a qui effettua un auto-commit
                                                // se si verifica un errore esegue un rollback

                                            })
                                                .then(() => {
                                                    if (rowPreferenze.notificaMovimenti == 1 && parseFloat(datiRicarica.importo+"") >= parseFloat(rowPreferenze.sogliaNotificaMovimenti+"")) {
                                                        Notifica.create({
                                                            descrizione: 'Effettuata ricarica di :'+datiRicarica.importo+'€',
                                                            refConto: datiRicarica.idMittente
                                                        });
                                                    }
                                                    callback(errorRicarica);
                                                })
                                                .catch((err) => {
                                                    errorRicarica = 'Errore: ' + err;
                                                    callback(errorRicarica);
                                                });
                                        });
                                    } else {
                                        errorRicarica = 'Effettua la ricarica con un metodo di pagamento avente lo stesso intestatario del conto PayPac';
                                        callback(errorRicarica);
                                    }
                                //se c'è stato un errore nell'inserimento del conto
                                } else {
                                    errorRicarica = 'Errore nella selezione del metodo di pagamento';
                                    callback(errorRicarica);
                                }
                            });
                        });
                } else {
                    errorRicarica = 'Superamento massimale giornaliero, aumenta il massimale dalle impostazioni o riprova domani';
                    if(Preferenze.notificaMassimaleGiornaliero == 1){
                        Notifica.create({
                            descrizione: 'Effettuata ricarica di :'+datiRicarica.importo+'€',
                            refConto: datiRicarica.idMittente
                        });
                    }
                    callback(errorRicarica);
                }
            });
        });
    },

    // Prende i dati dei pagamenti periodici
    getPagamenti: function (userId, callback) {
        PagamentoPeriodico.findAll({
            where: {
                refContoMitt: userId
            },
            include: [{
                model: ContoAziendale,
                required: true,
                raw: true
            }],
            order: [ ['dataInizio', 'DESC'] ],
            raw: true,
            nest: true
        }).then(function (rowPagamentoPeriodico){
            RichiestaPendente.findAll({
                where: {
                    refConto: userId
                },
                raw: true
            }).then(function (rowRichiestaPendente) {
                // oggetto contenente i dati dei pagamenti
                let pagamenti = {
                    pagamentiPeriodici: rowPagamentoPeriodico,
                    richiestePendenti: rowRichiestaPendente
                };
                callback(pagamenti);
            });
        });
    },

    // Inserisce i dati dei pagamenti periodici
    aggiungiPeriodico: function (datiPeriodico, callback) {
        let errorPeriodico = '';
        ContoAziendale.findOne({
            where: {
                ragioneSociale: datiPeriodico.nomeDestinatario
            },
            raw: true
            }).then(function (rowContoAziendale){
                if(rowContoAziendale) {
                    Conto.findOne({
                        where: {
                            id: rowContoAziendale.refConto
                        },
                        raw: true
                    }).then(function (rowContoDestinatario){
                        let datiBonifico = {
                            idMittente: datiPeriodico.idMittente,
                            nomeMittente: datiPeriodico.nomeMittente,
                            metodoPagamento: datiPeriodico.metodoPagamento,
                            iban: rowContoDestinatario.iban,
                            nomeIntestatario: rowContoAziendale.ragioneSociale,
                            causale: 'pagamento periodico con cadenza di '+ datiPeriodico.cadenza +' giorni da: '+ datiPeriodico.nomeMittente,
                            importo: datiPeriodico.importo
                        };
                        bonifico(datiBonifico, (errorBonifico) => {
                            if(!errorBonifico) {
                                PagamentoPeriodico.create({
                                    importo: datiPeriodico.importo,
                                    dataInizio: datiPeriodico.dataInizio,
                                    metodoPagamento: datiPeriodico.metodoPagamento,
                                    revoca: 0,
                                    cadenza: datiPeriodico.cadenza,
                                    refContoMitt: datiPeriodico.idMittente,
                                    refContoDest: rowContoAziendale.refConto,
                                })
                                    .then(() => {
                                        callback(errorPeriodico);
                                    });
                            } else {
                                callback(errorBonifico);
                            }
                        });
                    });
                } else {
                    errorPeriodico = 'Ragione sociale destinatario non trovata';
                    callback(errorPeriodico);
                }
            });
    },// TODO Unhandled rejection Error: WHERE parameter "iban" has invalid "undefined" value e controlla da qui in poi

    // Elimina un pagamento
    eliminaPeriodico: function (id, callback) {
        let errorEliminaPeriodico = '';
        PagamentoPeriodico.findOne({
            where: {
                id: id
            },
            raw: true
        }).then(function (rowPagamentoPeriodico){
            if(rowPagamentoPeriodico){
                PagamentoPeriodico.destroy({
                    where: {
                        id: id
                    }
                })
                    .then(() => {
                        callback(errorEliminaPeriodico);
                    });
            } else {
                errorEliminaPeriodico = 'Pagamento periodico non trovato';
                callback(errorEliminaPeriodico);
            }
        });
    },

    // Crea link pagamento
    creaLink: function (datiLink, callback) {
        let errorLink = '';
        let link = (Math.random().toString(36).slice(2))+''+datiLink.idMittente;
        if(datiLink.tipo == 'richiesta'){
            datiLink.importo = parseFloat(datiLink.importo+"") * (-1);
        }
        RichiestaPendente.create({
            link: link,
            importo: datiLink.importo,
            destinatario: datiLink.destinatario,
            refConto: datiLink.idMittente
        })
            .then(() => {
                callback(errorLink);
            })
            .catch((err) => {
                errorLink = 'Errore: '+err;
                callback(errorLink);
            });
    },

    // Controlla link
    controllaLink: function (url, callback) {
        RichiestaPendente.findOne({
            where: {
                link: url
            }
        }).then((rowRichiestaPendente) => {
            if(rowRichiestaPendente){
                let risultato = {
                    msg: 'Link di pagamento valido',
                    idLink: rowRichiestaPendente.id,
                    importo: rowRichiestaPendente.importo
                };
                callback(risultato);
            } else {
                let risultato = {
                    msg: 'Link di pagamento non valido'
                };
                callback(risultato);
            }
        });
    },

    // Elimina link
    eliminaLink: function (id, callback) {
        let errorEliminaLink = '';
        RichiestaPendente.findOne({
            where: {
                id: id
            },
            raw: true
        }).then(function (rowRichiestaPendente){
            if(rowRichiestaPendente){
                RichiestaPendente.destroy({
                    where: {
                        id: id
                    }
                })
                    .then(() => {
                        callback(errorEliminaLink);
                    });
            } else {
                errorEliminaLink = 'Link di pagamento non trovato';
                callback(errorEliminaLink);
            }
        });
    }
};