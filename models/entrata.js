/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('entrata', {
    'id': {
      type: DataTypes.INTEGER(13).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'importo': {
      type: "DOUBLE",
      allowNull: false,
      comment: "Attributo che indica l'importo del movimento"
    },
    'data': {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      comment: "Attributo che indica la data e l'ora in cui è stato effettuato il movimento "
    },
    'descrizione': {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Attributo che indica la descrizione del movimento"
    },
    'nomeMitt': {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: "Attributo che indica il nome/ragione sociale del mittente dell'importo"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto destinatario del movimento",
      references: {
        model: 'conto',
        key: 'id'
      }
    }
  }, {
    tableName: 'entrata'
  });
};
