/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conto', {
    'id': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'mail': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Attributo che indica la mail associata al conto",
      unique: true
    },
    'password': {
      type: DataTypes.CHAR(60),
      allowNull: true,
      comment: "null"
    },
    'tipo': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      comment: "Attributo che identifica la tipologia del conto: 0-personale, 1-aziendale"
    },
    'iban': {
      type: DataTypes.CHAR(27),
      allowNull: false,
      comment: "Attributo che indica l'iban dell'account: formato italiano, 27 caratteri che iniziano con IT, ABI-12345, CAB-supposto che i conti vengano divisi in filiali in base all'ordine di registrazione saranno le prime 5 cifre dell'ID, numero di conto corrente-ultime 5 cifre dell'ID precedute da sette 0",
      unique: true
    },
    'saldo': {
      type: "DOUBLE",
      allowNull: false,
      defaultValue: '0',
      comment: "Attributo che indica il saldo del conto"
    },
    'telefono': {
      type: DataTypes.CHAR(10),
      allowNull: true,
      comment: "Attributo che indica il numero di telefono associato al conto"
    },
    'idTelegram': {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "Attributo che indica l'ID Telegram associato al conto"
    }
  }, {
    tableName: 'conto',
  });
};
