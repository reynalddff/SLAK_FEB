<<<<<<< HEAD
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
=======
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
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221
