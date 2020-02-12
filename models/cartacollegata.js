/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cartacollegata', {
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
      comment: "Attributo che indica il nome dell'intestatario della carta"
    },
    'cognomeInt': {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Attributo che indica il cognome dell'intestatario della carta"
    },
    'pan': {
      type: DataTypes.STRING(19),
      allowNull: false,
      comment: "Attributo che indica il numero sulla carta di credito: varia da 16 a 19 cifre"
    },
    'scadenza': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Attributo che indica il mese e l'anno di scadenza della carta"
    },
    'cvv': {
      type: DataTypes.CHAR(4),
      allowNull: false,
      comment: "Attributo che indica il codice di sicurezza della carta: 4 cifre American Express, 3 le altre"
    },
    'refConto': {
      type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
      allowNull: false,
      comment: "Chiave esterna del conto a cui è stata collegata la carta",
      references: {
        model: 'conto',
        key: 'id'
      }
    }
  }, {
    tableName: 'cartacollegata'
  });
};
