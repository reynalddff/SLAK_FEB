'use strict';
const moment = require('moment')
module.exports = (sequelize, DataTypes) => {
  const Peminjaman_Kunci = sequelize.define('Peminjaman_Kunci', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    tanggal_pinjam: {
      type: DataTypes.DATEONLY,
      defaultValue: sequelize.NOW,
      allowNull: false,
      get() {
        return moment(this.getDataValue('tanggal_pinjam')).format('dddd, DD MMMM YYYY');
      }
    },
    tanggal_kembali: {
      type: DataTypes.DATEONLY,
      defaultValue: sequelize.NOW,
      get() {
        return moment(this.getDataValue('tanggal_kembali')).format('dddd, DD MMMM YYYY');
      }
    },
    keperluan: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    status_peminjaman: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['dipinjam', 'dikembalikan', 'menunggu validasi']],
          msg: "status kunci hanya tersedia 3 pilihan: menunggu validasi, dipinjam dan dikembalikan"
        }
      }
    }
  }, {});
  Peminjaman_Kunci.associate = function (models) {
    // associations can be defined here
    Peminjaman_Kunci.belongsTo(models.Kunci);
    Peminjaman_Kunci.belongsTo(models.User)
  };

  // Peminjaman_Kunci.sync({ force: true })
  return Peminjaman_Kunci;
};