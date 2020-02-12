/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contobanca', {
    'id': {
      type: DataTypes.INTEGER(13).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'iban': {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "Attributo che indica l'iban del conto: varia da 15 a 32 caratteri"
    },
    'nomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il nome dell'intestatario del conto"
    },
    'cognomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il cognome dell'intestatario del conto"
    },
    'valuta': {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: 'EUR',
      comment: "Attributo che indica la valuta del saldo del conto"
    },
    'saldo': {
      type: "DOUBLE",
      allowNull: false,
      defaultValue: '0',
      comment: "Attributo che indica il saldo del conto"
    }
  }, {
    tableName: 'contobanca'
  });
};
