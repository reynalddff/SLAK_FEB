"use strict";
const uploadDir = "/images/";
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  const Aduan_Lapor = sequelize.define(
    "Aduan_Lapor",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
        defaultValue: "-",
      },
      latitude: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
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
            args: [["belum", "sudah"]],
            msg: "status aduan hanya tersedia 2 pilihan: belum atau sudah",
          },
        },
      },
      foto_aduan: {
        type: DataTypes.STRING,
        defaultValue: "",
        get() {
          const image = this.getDataValue("foto_aduan");
          return uploadDir + image;
        },
      },
      kategori_aduan: {
        type: DataTypes.STRING,
        defaultValue: "Aduan lapor dan layanan",
      },
      tanggapan_aduan: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      tanggapan_user: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      tanggapan_tanggal: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        get() {
          return moment(this.getDataValue("tanggapan_tanggal")).format(
            "dddd, DD MMMM YYYY"
            // "MMMM"
          );
        },
      },
      tanggapan_foto: {
        type: DataTypes.STRING,
        defaultValue: "",
        get() {
          const image = this.getDataValue("tanggapan_foto");
          return uploadDir + image;
        },
      },
    },
    {
      // schema: "Aduan_Lapors",
      // tableName: "aduan_lapor",
    }
  );
  Aduan_Lapor.associate = function (models) {
    // associations can be defined here
    Aduan_Lapor.belongsTo(models.User);
    Aduan_Lapor.hasOne(models.Komentar, { onDelete: "CASCADE", hooks: true });
  };
  // Aduan_Lapor.sync({ force: true })
  return Aduan_Lapor;
};
