/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('richiestapendente', {
    'id': {
      type: DataTypes.INTEGER(13).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'link': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Attributo che indica il link da utilizzare per richiedere/inviare l'importo specificato nell'attributo importo",
      unique: true
    },
    'importo': {
      type: "DOUBLE",
      allowNull: false,
      comment: "Attributo che indica la somma da ricevere/inviare: negativo-invio denaro, positivo-richiesta denaro"
    },
    'destinatario': {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: "Attributo che indica nome e cognome/ragione sociale dell'intestatario del conto a cui è inviata la richiesta"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto che invia la richiesta",
      references: {
        model: 'conto',
        key: 'id'
      }
    }
  }, {
    tableName: 'richiestapendente'
  });
};
