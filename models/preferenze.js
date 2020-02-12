/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('preferenze', {
    'id': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      primaryKey: true,
      comment: "Chiave della tupla",
      autoIncrement: true
    },
    'PagamentoPreferito': {
      type: DataTypes.STRING(32),
      allowNull: true,
      comment: "Attributo che indica il metodo di pagamento preferito (iban/pan)"
    },
    'massimaleGiornaliero': {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '1000',
      comment: "Attributo che indica il massimo importo disponibile ogni 24h: 0-illimitato"
    },
    'notificaMassimaleGiornaliero': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: "Attributo che indica l'attivazione del servizio di notifiche se avviene un tentativo di pagamento che supera il massimale giornaliero"
    },
    'notificaMovimenti': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: "Attributo che indica l'attivazione del servizio di notifiche se avviene un movimento sul conto che superi la soglia specificata nell'attributo sogliaNotificaMovimenti"
    },
    'sogliaNotificaMovimenti': {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '100',
      comment: "Attributo che, se è attivo il servizio di notifiche movimenti, indica la soglia che devono superare i movimenti per essere notificati: 0-notifica ogni movimento"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui fanno riferimento le preferenze specificate",
      references: {
        model: 'conto',
        key: 'id'
      },
      unique: true
    }
  }, {
    tableName: 'preferenze'
  });
};
