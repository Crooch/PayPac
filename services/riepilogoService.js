let riepilogoRepository = require('../repository/riepilogoRepository');
let autenticazioneService = require('../services/autenticazioneService');



// formatta la data dal formato del db al formato del front-end
function formattaDataFront(data) {
    let formatoCorretto = data.substring(8) + "-" + data.substring(5, 7) + "-" + data.substring(0, 4);
    formatoCorretto = formatoCorretto.replace("-", "/");
    return formatoCorretto.replace("-", "/");
}

module.exports = {

    // recupera i dati di riepilogo dell'utente
    getUserData: function (userId, callback) {
        // prende i dati di riepilogo dal DB
        riepilogoRepository.getUserData(userId, (userData) => {
            userData.dataN = formattaDataFront(userData.dataN);
            callback(userData);
        });
    },


    // recupera le preferenze dell'utente
    getUserSettings: function (userId, callback) {
        // prende i dati di riepilogo dal DB
        riepilogoRepository.getUserSettings(userId, (userSettings) => {
            callback(userSettings);
        });
    },


    // verifica form registrazione
    verificaDatiProfilo: function (req, callback) {
        riepilogoRepository.mailFromId(req.user.id).then(function(result) {
            // controllo mail
            riepilogoRepository.verificaMail (req.body.newemail, result.mail, (mailError)=>{
                //controlli vari
                req.checkBody('newemail',"Indirizzo mail richiesto").notEmpty();
                req.checkBody('newemail',"Inserire un indirizzo mail valido").isEmail();
                req.checkBody('confermapassword',"Le password non coincidono").equals(req.body.newpassword);
                req.checkBody({
                    'newntel': {
                        optional: {
                            options: { checkFalsy: true }
                        },
                        isNumeric: {
                            errorMessage: 'Formato numero di telefono errato'
                        }
                    }
                });
                if(req.body.tipoprofilo==0){
                    req.checkBody('newnomeint',"Il nome dell'intestatario è obbligatorio").notEmpty();
                    req.checkBody('newcognomeint',"Il cognome dell'intestatario è obbligatorio").notEmpty();
                    req.checkBody('newcf',"Il codice fiscale è obbligatorio").notEmpty();
                    req.checkBody('newdatan',"La data di nascita è obbligatoria").notEmpty();
                }
                if(req.body.tipoprofilo==1){
                    req.checkBody('newragsociale',"La ragione sociale è obbligatoria").notEmpty();
                    req.checkBody('newpiva',"la partita iva è obbligatoria").notEmpty();
                }
                let errors = req.validationErrors();
                if(mailError){
                    errors.push(mailError);
                }
                callback(errors);
            });
        });
    },


    // salva i dati aggiornati del profilo nel db
    saveDatiProfilo: function (agg, id) {
        if(agg.password){
            autenticazioneService.criptaPassword(agg.password, (hash)=>{
                agg.password = hash;
            });
        } else {
            this.getUserData(req.user.id, (userData) => {
                agg.password = userData.password;
            });
        }
        riepilogoRepository.saveDatiProfilo(agg, id);
    },


    saveImpostazioni: function (agg, id) {
        riepilogoRepository.saveImpostazioni(agg, id);
    }

};