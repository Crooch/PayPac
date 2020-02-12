/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contocollegato', {
    'id': {
      type: DataTypes.INTEGER(13).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'nomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il nome dell'intestatario del conto collegato"
    },
    'cognomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il cognome dell'intestatario del conto collegato"
    },
    'iban': {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "Attributo che indica l'iban del conto collegato: varia da 15 a 32 caratteri"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui è stato collegato il conto",
      references: {
        model: 'conto',
        key: 'id'
      }
    }
  }, {
    tableName: 'contocollegato'
  });
};
