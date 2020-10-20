'use strict';
module.exports = (sequelize, DataTypes) => {
  const Data_Pengembalian = sequelize.define('Data_Pengembalian', {
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    nama_pengembali: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },
    status_pengembalian: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [["masih dipinjam", "sudah dikembalikan"]],
          msg:
            "status kunci hanya tersedia 2 pilihan: masih dipinjam dan sudah dikembalikan",
        },
      },
    }
  }, {});
  Data_Pengembalian.associate = function (models) {
    // associations can be defined here
    Data_Pengembalian.belongsTo(models.Data_Peminjaman);
  };
  return Data_Pengembalian;
};