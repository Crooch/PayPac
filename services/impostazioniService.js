let impostazioniRepository = require('../repository/impostazioniRepository');


module.exports = {

    // recupera i dati di riepilogo dell'utente
    getUserData: function (userId, callback) {
        // prende i dati di riepilogo dal DB
        riepilogoRepository.getUserData(userId, (userData) => {
            callback(userData);
        });
    }
};