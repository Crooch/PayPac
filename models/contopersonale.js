/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contopersonale', {
    'id': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'nomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il nome dell'intestatario del conto "
    },
    'cognomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il cognome dell'intestatario del conto"
    },
    'dataN': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Attributo che indica la data di nascita dell'intestatario del conto"
    },
    'cf': {
      type: DataTypes.CHAR(16),
      allowNull: false,
      comment: "Attributo che indica il codice fiscale dell'intestatario del conto"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui fanno riferimento i dati personali",
      references: {
        model: 'conto',
        key: 'id'
      },
      unique: true
    }
  }, {
    tableName: 'contopersonale'
  });
};
