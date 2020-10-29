"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Data_Peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Data_Peminjaman.belongsTo(models.User);
      Data_Peminjaman.hasOne(models.Data_Pengembalian, { onDelete: "CASCADE" });
      Data_Peminjaman.hasOne(models.Detail_Peminjaman, { onDelete: "CASCADE" });
    }
  }
  Data_Peminjaman.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      keperluan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      identitas: {
        type: DataTypes.STRING,
        allowNull: false,
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
      },
    },
    {
      sequelize,
      modelName: "Data_Peminjaman",
    }
  );
  return Data_Peminjaman;
};
