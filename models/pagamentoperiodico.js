/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pagamentoperiodico', {
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
      comment: "Attributo che indica l'importo del pagamento periodico"
    },
    'dataInizio': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Attributo che indica la data dalla quale inizierà il pagamento periodico"
    },
    'metodoPagamento': {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: "Attributo che indica il metodo di pagamento per il pagamento perodico"
    },
    'revoca': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      comment: "Attributo che indica se il pagamento periodico è stato revocato o è ancora in programma"
    },
    'cadenza': {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      comment: "Attributo che indica il numero di giorni che devono trascorrere fra un pagamento e l'altro"
    },
    'refContoMitt': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto che emette il pagamento periodico",
      references: {
        model: 'conto',
        key: 'id'
      }
    },
    'refContoDest': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto aziendale che riceve il pagamento periodico",
      references: {
        model: 'contoaziendale',
        key: 'id'
      }
    }
  }, {
    tableName: 'pagamentoperiodico'
  });
};