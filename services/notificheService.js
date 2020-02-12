let notificheRepository = require('../repository/notificheRepository');



module.exports = {

    // recupera le notifiche dell'utente
    getNotifiche: function (userId, callback) {
        notificheRepository.getNotifiche(userId, (Notifiche) => {
            for (let i in Notifiche) {
                Notifiche[i].data = Notifiche[i].data.getDate() + "/" + (Notifiche[i].data.getMonth()+1) + "/" + Notifiche[i].data.getFullYear() + " " + Notifiche[i].data.getHours() + ":" + Notifiche[i].data.getMinutes();
            }
            callback(Notifiche);
        });
    },


    // crea le notifiche
    setNotifiche: function (userId, descrizione) {
        let dataCorrente = new Date;
        let datetime = dataCorrente.getFullYear() + "-" + dataCorrente.getMonth() + "-" + dataCorrente.getDate() + " " + dataCorrente.getHours() + ":" + dataCorrente.getMinutes() + ":" + dataCorrente.getSeconds();
        notificheRepository.setNotifiche(userId, datetime, descrizione);
    }

};