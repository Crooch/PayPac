let bcrypt = require('bcryptjs');
let autenticazioneRepository = require('../repository/autenticazioneRepository');

module.exports = {

    // prepara il formato visualizzato della data per essere inserito nel db
    formattaDataDB: function (data) {
        let formatoCorretto = data.substring(6) + "/" + data.substring(3, 6) + data.substring(0, 2);
        formatoCorretto = formatoCorretto.replace("/", "-");
        return formatoCorretto.replace("/", "-");
    },


    //  cripta la password
    criptaPassword: function (password, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                callback(hash);
            });
        });
    },


    // verifica form registrazione
    verifica: function (req, callback) {
        // controllo mail
        autenticazioneRepository.verificaMail (req.body.regemail, (mailError)=>{
            //controlli vari
            req.checkBody('regemail',"Indirizzo mail richiesto").notEmpty();
            req.checkBody('regemail',"Inserire un indirizzo mail valido").isEmail();
            req.checkBody('regpassword',"Inserire una password").notEmpty();
            req.checkBody('regpassword',"Inserire una password di minimo 8 caratteri").isLength({ min: 8 });
            req.checkBody('confermapassword',"Le password non coincidono").equals(req.body.regpassword);
            req.checkBody({
                'regntel': {
                    optional: {
                        options: { checkFalsy: true }
                    },
                    isNumeric: {
                        errorMessage: 'Formato numero di telefono errato'
                    }
                }
            });
            req.checkBody('regtabattiva',"Errore nella selezione del tipo di profilo").notEmpty().matches(/^[0-1]{1}$/, "i");
            if(req.body.regtabattiva==0){
                req.checkBody('regnomeint',"Il nome dell'intestatario è obbligatorio").notEmpty();
                req.checkBody('regcognomeint',"Il cognome dell'intestatario è obbligatorio").notEmpty();
                req.checkBody('regcf',"Il codice fiscale è obbligatorio").notEmpty();
                req.checkBody('regdatan',"La data di nascita è obbligatoria").notEmpty();
            }
            if(req.body.regtabattiva==1){
                req.checkBody('regragsociale',"La ragione sociale è obbligatoria").notEmpty();
                req.checkBody('regpiva',"la partita iva è obbligatoria").notEmpty();
            }
            let errors = req.validationErrors();
            if(mailError){
                errors.push(mailError);
            }
            callback(errors);
        });
    },


    // salva i dati della registrazione nel db
    save: function ( reg, saldoIniziale ) {
        autenticazioneRepository.save(reg, saldoIniziale);
    }
};