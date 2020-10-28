"use strict";
module.exports = (sequelize, DataTypes) => {
  const Kunci = sequelize.define(
    "Kunci",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
        allowNull: false,
      },
      nama_ruangan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status_kunci: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["tersedia", "renovasi", "tidak tersedia", "dipinjam"]],
            msg:
              "status kunci hanya tersedia 3 pilihan: tersedia, renovasi, dan tidak tersedia",
          },
        },
      },
    },
    {}
  );
  Kunci.associate = function (models) {
    // associations can be defined here
    Kunci.hasMany(models.Detail_Peminjaman, { onDelete: "CASCADE" });
  };
  return Kunci;
};
