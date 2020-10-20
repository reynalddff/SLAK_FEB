'use strict';
module.exports = (sequelize, DataTypes) => {
  const Data_Peminjaman = sequelize.define('Data_Peminjaman', {
    keperluan: {
      type: DataTypes.STRING,
      allowNull: false
    },
    identitas: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status_peminjaman: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [["menunggu validasi", "sudah divalidasi", "dikembalikan"]],
          msg:
            "status kunci hanya tersedia 2 pilihan: menunggu validasi dan sudah divalidasi",
        },
      },
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  }, {});
  Data_Peminjaman.associate = function (models) {
    // associations can be defined here
    Data_Peminjaman.belongsTo(models.User);
    Data_Peminjaman.hasOne(models.Data_Pengembalian, { onDelete: "CASCADE", hooks: true });
  };
  return Data_Peminjaman;
};