<<<<<<< HEAD
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Data_Pengembalian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Data_Pengembalian.belongsTo(models.Data_Peminjaman);
    }
  }
  Data_Pengembalian.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
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
      },
    },
    {
      sequelize,
      modelName: "Data_Pengembalian",
    }
  );
  return Data_Pengembalian;
};
=======
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
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
