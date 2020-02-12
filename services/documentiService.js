documentiRepository = require('../repository/documentiRepository');



module.exports = {

    // recupera i documenti dell'utente
    getDocumenti: function (idUtente, callback) {
        documentiRepository.getDocumenti(idUtente, (documenti) => {
            for(let i in documenti){
                // formatta data front
                documenti[i].data = "1-" + documenti[i].data.substring(5, 7) + "-" + documenti[i].data.substring(0, 4);
                documenti[i].data = documenti[i].data.replace("-", "/");
                documenti[i].data = documenti[i].data.replace("-", "/");
            }
            callback(documenti);
        });
    },

    // richiedi estratto conto
    richiestaEstrattoConto: function (datiEstrattoConto, callback) {
        documentiRepository.richiestaEstrattoConto(datiEstrattoConto, (errorDocumenti) => {
            callback(errorDocumenti);
        });
    }
};