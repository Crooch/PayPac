let pagamentiRepository = require('../repository/pagamentiRepository');



module.exports = {

    // effettua il bonifico
    effettuaBonifico: function (datiBonifico, callback) {
        if(datiBonifico.importo <= 0){
            callback('Inserire un importo valido');
        } else {
            // inserisce i dati del bonifico nel db
            pagamentiRepository.effettuaBonifico(datiBonifico, (errorBonifico) => {
                callback(errorBonifico);
            });
        }
    },

    // effettua ricarica
    effettuaRicarica: function (datiRicarica, callback) {
        if(datiRicarica.importo <= 0){
            callback('Inserire un importo valido');
        } else {
            // inserisce i dati della ricarica nel db
            pagamentiRepository.effettuaRicarica(datiRicarica, (errorRicarica) => {
                callback(errorRicarica);
            });
        }
    },

    // Prende i dati dei pagamenti periodici
    getPagamenti: function (userId, callback) {
        pagamentiRepository.getPagamenti(userId, pagamenti => {
            // formatta data front
            for(let i in pagamenti.pagamentiPeriodici){
                pagamenti.pagamentiPeriodici[i].dataInizio = pagamenti.pagamentiPeriodici[i].dataInizio.substring(8) + "-" + pagamenti.pagamentiPeriodici[i].dataInizio.substring(5, 7) + "-" + pagamenti.pagamentiPeriodici[i].dataInizio.substring(0, 4);
                pagamenti.pagamentiPeriodici[i].dataInizio = pagamenti.pagamentiPeriodici[i].dataInizio.replace("-", "/");
                pagamenti.pagamentiPeriodici[i].dataInizio = pagamenti.pagamentiPeriodici[i].dataInizio.replace("-", "/");
            }
            callback(pagamenti);
        });
    },

    // Inserisce i dati dei pagamenti periodici
    aggiungiPeriodico: function (idPeriodico, callback) {
        pagamentiRepository.aggiungiPeriodico(idPeriodico, errorPeriodico => {
            callback(errorPeriodico);
        });
    },

    // Elimina un pagamento
    eliminaPeriodico: function (id, callback) {
        pagamentiRepository.inserisciPeriodico(id, errorEliminaPeriodico => {
            callback(errorEliminaPeriodico);
        });
    },

    // Crea link pagamento
    creaLink: function (datiLink, callback) {
        pagamentiRepository.creaLink(datiLink, errorLink => {
            callback(errorLink);
        });
    },

    // Controlla link
    controllaLink: function (url, callback) {
        pagamentiRepository.eliminaLink(url, check => {
            callback(check);
        });
    },

    // Elimina link
    eliminaLink: function (id, callback) {
        pagamentiRepository.eliminaLink(id, errorLink => {
            callback(errorLink);
        });
    }
};