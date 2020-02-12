/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contoaziendale', {
    'id': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'pIva': {
      type: DataTypes.STRING(12),
      allowNull: false,
      comment: "Attributo che indica la partita IVA dell'azienda"
    },
    'ragioneSociale': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica la ragione sociale dell'azienda"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui fanno riferimento i dati aziendali",
      references: {
        model: 'conto',
        key: 'id'
      },
      unique: true
    }
  }, {
    tableName: 'contoaziendale'
  });
};
