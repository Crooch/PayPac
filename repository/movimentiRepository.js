const {Op} = require("sequelize");
let models = require('../models');
let Entrata = models.entrata;
let Uscita = models.uscita;



module.exports = {

    // recupera i movimenti di riepilogo dell'utente
    getMovimenti: function (filtro, callback) {
        // conversione formato da stringa a data
        let dateArrayInizio = filtro.dataInizio.split("-");
        let meseInizioJavascriptFormat = parseInt(dateArrayInizio[1], 10);
        let dataInizio = new Date(dateArrayInizio[0], meseInizioJavascriptFormat-1, dateArrayInizio[2]);
        let dateArrayFine = filtro.dataFine.split("-");
        let meseFineJavascriptFormat = parseInt(dateArrayFine[1], 10);
        let dataFine = new Date(dateArrayFine[0], meseFineJavascriptFormat-1, dateArrayFine[2], 23, 59, 59);
        // tutti i movimenti
        if (filtro.tipo == 0) {
            Entrata.findAll({
                where: {
                    data: {
                        [Op.between]: [dataInizio, dataFine]
                    },
                    importo: {
                        [Op.gte]: filtro.maggioreDi
                    },
                    refConto: filtro.utente
                },
                order: [ ['data', 'DESC'] ],
                raw: true
            }).then(function (rowEntrata) {
                Uscita.findAll({
                    where: {
                        data: {
                            [Op.between]: [dataInizio, dataFine]
                        },
                        importo: {
                            [Op.lte]: -filtro.maggioreDi
                        },
                        refConto: filtro.utente
                    },
                    order: [['data', 'DESC']],
                    raw: true
                }).then(function (rowUscita) {
                    let ultimiMovimenti = rowEntrata;
                    for (let i in rowUscita) {
                        ultimiMovimenti.push(rowUscita[i]);
                    }
                    callback(ultimiMovimenti);
                });
            });
        }
        // entrate
        else if (filtro.tipo == 1) {
            Entrata.findAll({
                where: {
                    data: {
                        [Op.between]: [dataInizio, dataFine]
                    },
                    importo: {
                        [Op.gte]: filtro.maggioreDi
                    },
                    refConto: filtro.utente
                },
                order: [ ['data', 'DESC'] ],
                raw: true
            }).then(function (rowEntrata) {
                    callback(rowEntrata);
            });
        }
        // uscite
        else if (filtro.tipo == 2) {
            Uscita.findAll({
                where: {
                    data: {
                        [Op.between]: [dataInizio, dataFine]
                    },
                    importo: {
                        [Op.gte]: filtro.maggioreDi
                    },
                    refConto: filtro.utente
                },
                order: [ ['data', 'DESC'] ],
                raw: true
            }).then(function (rowUscita) {
                callback(rowUscita);
            });
        } else {
            let movimenti = {
                errormsg: "Errore nella selezione del tipo di transazione"
            };
            callback(movimenti);
        }
    }
};