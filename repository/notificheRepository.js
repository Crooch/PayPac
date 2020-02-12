let models = require('../models');
let Notifiche = models.notifica;



module.exports = {

    // recupera le notifiche dell'utente
    getNotifiche: function (userId, callback) {
        return Notifiche.findAll({
            where: {
                refConto: userId
            },
            order: [ ['data', 'DESC'] ],
            limit: 5,
            raw: true
        }).then(function (rowNotifiche){
            callback(rowNotifiche);
        });
    },


    // crea le notifiche
    setNotifiche: function (id, data, descrizione) {
        Notifiche.create({
            refConto: id,
            data: data,
            descrizione: descrizione,
        })
            .then(() => {
                console.log('queries ran successfully');
            })
            .catch((err) => {
                console.log('queries failed', err);
            });
    }

};