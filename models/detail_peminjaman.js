'use strict';
module.exports = (sequelize, DataTypes) => {
  const Detail_Peminjaman = sequelize.define('Detail_Peminjaman', {
    status: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [["menunggu validasi", "dipinjam", "dikembalikan"]],
          msg:
            "status kunci hanya tersedia 3 pilihan: menunggu validasi, dipinjam dan dikembalikan",
        },
      },
    },
  }, {});
  Detail_Peminjaman.associate = function (models) {
    // associations can be defined here
    Detail_Peminjaman.belongsTo(models.Data_Peminjaman, { onDelete: "CASCADE", hooks: true });
    Detail_Peminjaman.belongsTo(models.Kunci);
  };
  return Detail_Peminjaman;
};