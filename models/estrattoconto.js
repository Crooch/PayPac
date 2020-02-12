/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('estrattoconto', {
    'id': {
      type: DataTypes.INTEGER(13).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'data': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Attributo che indica il mese e l'anno dell'estratto conto"
    },
    'saldoChiusura': {
      type: "DOUBLE",
      allowNull: false,
      comment: "Attributo che indica il saldo di chiusura dell'estratto conto"
    },
    'file': {
      type: "MEDIUMBLOB",
      allowNull: false,
      comment: "Attributo che contiene il file pdf dell'estratto conto: massimo 16 MB"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui fa riferimento l'estratto conto",
      references: {
        model: 'conto',
        key: 'id'
      }
    }
  }, {
    tableName: 'estrattoconto'
  });
};
