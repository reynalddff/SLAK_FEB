'use strict';
const uploadDir = '/images/'
module.exports = (sequelize, DataTypes) => {
  const Aduan_Lapor = sequelize.define('Aduan_Lapor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    judul_aduan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi_aduan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lokasi_aduan: {
      type: DataTypes.STRING,
      defaultValue: "-"
    },
    tujuan_aduan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_aduan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "belum",
      validate: {
        isIn: {
          args: [['belum', 'sudah']],
          msg: "status aduan hanya tersedia 3 pilihan: belum atau sudah"
        }
      }
    },
    foto_aduan: {
      type: DataTypes.STRING,
      defaultValue: "",
      get() {
        const image = this.getDataValue('image');
        return uploadDir + image
      }
    },
    tanggapan_aduan: {
      type: DataTypes.STRING,
      defaultValue: ""
    }
  }, {});
  Aduan_Lapor.associate = function (models) {
    // associations can be defined here
    Aduan_Lapor.hasOne(models.Komentar, { onDelete: 'CASCADE', hooks: true });
    Aduan_Lapor.belongsTo(models.User);
  };
  return Aduan_Lapor;
};