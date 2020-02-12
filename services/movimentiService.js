let movimentiRepository = require('../repository/movimentiRepository');



module.exports = {

    // recupera il riepilogo movimenti dell'utente
    getMovimenti: function (filtro, callback) {
        // sistema la data di inizio e di fine del filtro di default
        if(filtro.dataInizio){
            filtro.dataInizio = filtro.dataInizio.substring(6) + "/" + filtro.dataInizio.substring(3, 6) + filtro.dataInizio.substring(0, 2);
            filtro.dataInizio = filtro.dataInizio.replace("/", "-");
            filtro.dataInizio = filtro.dataInizio.replace("/", "-");
        } else {
            let meseScorso = new Date;
            if(meseScorso.getMonth() == 0) {
                filtro.dataInizio = (meseScorso.getFullYear()-1) + "-12-" + meseScorso.getDate();
            } else if(meseScorso.getMonth() < 10) {
                filtro.dataInizio = meseScorso.getFullYear() + "-0" + meseScorso.getMonth() + "-" + meseScorso.getDate();
            } else {
                filtro.dataInizio = meseScorso.getFullYear() + "-" + meseScorso.getMonth() + "-" + meseScorso.getDate();
            }
        }
        if(filtro.dataFine){
            filtro.dataFine = filtro.dataFine.substring(6) + "/" + filtro.dataFine.substring(3, 6) + filtro.dataFine.substring(0, 2);
            filtro.dataFine = filtro.dataFine.replace("/", "-");
            filtro.dataFine = filtro.dataFine.replace("/", "-");
        } else {
            let dataCorrente = new Date;
            if(dataCorrente.getMonth() < 9) {
                filtro.dataFine = dataCorrente.getFullYear() + "-0" + (dataCorrente.getMonth() + 1) + "-" + dataCorrente.getDate();
            } else {
                filtro.dataFine = dataCorrente.getFullYear() + "-" + (dataCorrente.getMonth() + 1) + "-" + dataCorrente.getDate();
            }
        }
        if(filtro.maggioreDi == null) {
            filtro.maggioreDi = 0;
        }
        // controllo errori
        let errormsg = "";
        if(filtro.dataInizio > filtro.dataFine){
            errormsg = "La data di inizio della ricerca deve essere precedente a quella di fine"
        }
        // prende i dati di riepilogo dal DB
        movimentiRepository.getMovimenti(filtro, (movimenti) => {
            // converti le date del filtro nuovamente nel formato frontend
            filtro.dataInizio = filtro.dataInizio.substring(8) + "-" + filtro.dataInizio.substring(5, 8) + filtro.dataInizio.substring(0, 4);
            filtro.dataInizio = filtro.dataInizio.replace("-", "/");
            filtro.dataInizio = filtro.dataInizio.replace("-", "/");
            filtro.dataFine = filtro.dataFine.substring(8) + "-" + filtro.dataFine.substring(5, 8) + filtro.dataFine.substring(0, 4);
            filtro.dataFine = filtro.dataFine.replace("-", "/");
            filtro.dataFine = filtro.dataFine.replace("-", "/");
            // converti le date dei movimenti nel formato fronend
            for (let i in movimenti) {
                movimenti[i].data = movimenti[i].data.getDate() + "/" + (movimenti[i].data.getMonth()+1) + "/" + movimenti[i].data.getFullYear() + " " + movimenti[i].data.getHours() + ":" + movimenti[i].data.getMinutes();
            }
            movimenti.errormsg = errormsg;
            callback(movimenti);
        });
    }
};