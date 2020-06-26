'use strict';
module.exports = (sequelize, DataTypes) => {
  const Komentar = sequelize.define('Komentar', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    deskripsi_komentar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "-"
    },
    nilai_komentar: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "-"
    }
  }, {});
  Komentar.associate = function (models) {
    // associations can be defined here
    Komentar.belongsTo(models.User);
    Komentar.belongsTo(models.Aduan_Lapor);
  };
  // Komentar.sync({ force: true })
  return Komentar;
};