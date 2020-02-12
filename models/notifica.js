/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notifica', {
    'id': {
      type: DataTypes.INTEGER(13).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'data': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Attributo che indica la data e l'ora dell'invio della notifica"
    },
    'descrizione': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Attributo che indica la descrizione della notifica"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui viene inviata la notifica",
      references: {
        model: 'conto',
        key: 'id'
      }
    }
  }, {
    tableName: 'notifica'
  });
};
