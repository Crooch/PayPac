const {Op} = require("sequelize");
let models = require('../models');
let Entrata = models.entrata;
let Uscita = models.uscita;
let EstrattoConto = models.estrattoconto;

//pachetti per creazione pdf
let pdf = require("pdf-creator-node");
let fs = require('fs');
// opzioni pdf
var options = {
    phantomPath: './node_modules/phantomjs-prebuilt/bin/phantomjs',
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
        height: "45mm",
        contents: '<div style="text-align: center;">PayPac</div>'
    },
    "footer": {
        "height": "28mm",
        "contents": {
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: 'Ultima Pagina'
        }
    }
};

// leggi template HTML
let html = fs.readFileSync('config/estrattoContoTemplate.html', 'utf8');


module.exports = {

    // recupera i documenti dell'utente dal db
    getDocumenti: function (idUtente, callback) {
        EstrattoConto.findAll({
            where: {
                refConto: idUtente,
            },
            order: [ ['data', 'DESC'] ],
            raw: true
        }).then(function (rowEstrattoConto) {
            let documenti = rowEstrattoConto;
            callback(documenti);
        });
    },

    // richiedi estratto conto
    richiestaEstrattoConto: function (datiEstrattoConto, callback) {
        let errorDocumenti = '';
        let dataInizio = new Date(datiEstrattoConto.anno, datiEstrattoConto.mese, 1, 0,0,0);
        let dataFine;
        if(datiEstrattoConto.mese == 11){
            dataFine = new Date(parseInt(datiEstrattoConto.anno)+1, 0, 1, 0, 0, 0);
        } else {
            dataFine = new Date(datiEstrattoConto.anno, parseInt(datiEstrattoConto.mese)+1, 1, 0, 0, 0);
        }
        Entrata.findAll({
            where: {
                data: {
                    [Op.lt]: [dataInizio]
                },
                refConto: datiEstrattoConto.idUtente
            },
            order: [ ['data', 'DESC'] ],
            raw: true
        }).then(function (rowEntrataSaldoIniziale) {
            Uscita.findAll({
                where: {
                    data: {
                        [Op.lt]: [dataInizio]
                    },
                    refConto: datiEstrattoConto.idUtente
                },
                order: [['data', 'DESC']],
                raw: true
            }).then(function (rowUscitaSaldoIniziale) {
                let ultimiMovimenti = rowEntrataSaldoIniziale;
                for (let i in rowUscitaSaldoIniziale) {
                    ultimiMovimenti.push(rowUscitaSaldoIniziale[i]);
                }
                let saldoIniziale = 0;
                for (let i in ultimiMovimenti) {
                    saldoIniziale += ultimiMovimenti[i].importo;
                }
                Entrata.findAll({
                    where: {
                        data: {
                            [Op.between]: [dataInizio, dataFine]
                        },
                        refConto: datiEstrattoConto.idUtente
                    },
                    order: [['data', 'DESC']],
                    raw: true
                }).then(function (rowEntrata) {
                    Uscita.findAll({
                        where: {
                            data: {
                                [Op.between]: [dataInizio, dataFine]
                            },
                            refConto: datiEstrattoConto.idUtente
                        },
                        order: [['data', 'DESC']],
                        raw: true
                    }).then(function (rowUscita) {
                        let movimentiEstrattoConto = rowEntrata;
                        for (let i in rowUscita) {
                            movimentiEstrattoConto.push(rowUscita[i]);
                        }
                        let saldoMese = 0;
                        for (let i in movimentiEstrattoConto) {
                            saldoMese += movimentiEstrattoConto[i].importo;
                        }
                        let saldoFinale = saldoIniziale + saldoMese;

                        // imposto oggetto per riempire template html
                        let movimenti = [];
                        let nomeMittDest;
                        let data;
                        let dataFormattata;
                        for(let i in movimentiEstrattoConto){
                            if(movimentiEstrattoConto[i].nomeMitt){
                                nomeMittDest = movimentiEstrattoConto[i].nomeMitt;
                            } else {
                                nomeMittDest = movimentiEstrattoConto[i].nomeDest;
                            }
                            //formatta data
                            data = new Date(movimentiEstrattoConto[i].data);
                            dataFormattata = data.getDate() + '/' + data.getMonth() + '/' + data.getFullYear();
                            movimenti[i] = {
                                data: dataFormattata,
                                mittente: nomeMittDest,
                                causale: movimentiEstrattoConto[i].descrizione,
                                Importo: movimentiEstrattoConto[i].importo,
                            };
                        }
                        let document = {
                            html: html,
                            data: {
                                nomeUtente: datiEstrattoConto.nomeUtente,
                                mese: "0"+(parseInt(datiEstrattoConto.mese) + 1),
                                anno: datiEstrattoConto.anno,
                                saldoIniziale: saldoIniziale,
                                saldoFinale: saldoFinale,
                                movimenti: movimenti
                            },
                            path: 'tmp/' + datiEstrattoConto.nomeUtente +' '+ (parseInt(datiEstrattoConto.mese)+1) +'-'+ datiEstrattoConto.anno + '.pdf'
                        };
                        // creo pdf
                        pdf.create(document, options)
                            .then(res => {
                                console.log(res)
                            })
                            .catch(error => {
                                console.error(error)
                            });
                        //inserisco nel db
                        let pdfEstrattoConto = fs.readFileSync('tmp/' + datiEstrattoConto.nomeUtente +' '+ (parseInt(datiEstrattoConto.mese)+1) +'-'+ datiEstrattoConto.anno + '.pdf');
                        EstrattoConto.create({
                            data: pdfEstrattoConto
                        }).then(function () {
                            //cancello dalla cartella tmp
                            const path = 'tmp/' + datiEstrattoConto.nomeUtente +' '+ (parseInt(datiEstrattoConto.mese)+1) +'-'+ datiEstrattoConto.anno + '.pdf';
                            fs.unlink(path, (err) => {
                                if (err) {
                                    console.error(err)
                                    callback(errorDocumenti);
                                }
                            });
                        });
                    });
                });
            });
        });
    }
};