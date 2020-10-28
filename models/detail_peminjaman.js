"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Detail_Peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Detail_Peminjaman.belongsTo(models.Data_Peminjaman);
      Detail_Peminjaman.belongsTo(models.Kunci);
    }
  }
  Detail_Peminjaman.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
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
    },
    {
      sequelize,
      modelName: "Detail_Peminjaman",
    }
  );
  return Detail_Peminjaman;
};
