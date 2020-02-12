let models = require('../models');
let Conto = models.conto;
let Preferenze = models.preferenze;
let ContoPersonale = models.contopersonale;
let ContoAziendale = models.contoaziendale;


function getMail(email) {
    return Conto.findOne({
        attributes: ['mail'],
        where: {
            mail: email
        }
    });
}

module.exports = {

    // verifica se la mail è presente nel db
    verificaMail: function (email, callback) {
        getMail(email).then(function(result){
            let error;
            if (result) {
                error = {
                    location: 'body',
                    value: 'req.body.regemail',
                    param: "regemail",
                    msg: "Email già registrata, hai dimenticato la password?"
                };
            }
            callback(error);
        });
    },


    // ricava l'id dell'utente successivo che verrà inserito nel db
    nextId: function (callback) {
        return models.sequelize.query("SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'paypac' AND TABLE_NAME = 'conto'", { raw: true })
            .then(result => {
                callback(parseInt(result[0].map((conto) => conto.AUTO_INCREMENT)));
            })
    },


    // salva i dati della registrazione nel db
    save: function (reg, saldoIniziale) {
        this.nextId((nextId) => {
            // trasforma il nextId in una stringa zeroFill di lunghezza 10
            let lunghezzaId = 10;
            lunghezzaId -= nextId.toString().length;
            let id = new Array(lunghezzaId + (/\./.test(nextId) ? 2 : 1)).join('0') + nextId;
            // calcolo IBAN
            let abi = 12345;
            let cab = id.substring(0, 5);
            let nconto = id.substring(5, 10);
            let iban = `IT02L${abi}0000000${cab}${nconto}`;
                // inizio transazione
                models.sequelize.transaction((transaction) => {
                    return Promise.all([
                        Conto.create({
                            id: nextId,
                            mail: reg.email,
                            password: reg.password,
                            tipo: reg.tipo,
                            telefono: reg.telefono,
                            idTelegram: reg.telegram,
                            saldo: saldoIniziale,
                            iban: iban
                        }, { transaction }),

                        Preferenze.create({
                            refConto: nextId
                        }, { transaction }),

                        reg.tipo == 0
                            ? ContoPersonale.create({
                                nomeInt: reg.nome,
                                cognomeInt: reg.cognome,
                                dataN: reg.datan,
                                cf: reg.cf,
                                refConto: nextId
                            }, { transaction })
                            : ContoAziendale.create({
                                pIva: reg.piva,
                                ragioneSociale: reg.ragsoc,
                                refConto: nextId
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
        });
    }
};