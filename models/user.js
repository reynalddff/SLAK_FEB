'use strict';
const bcrypt = require('bcryptjs')
const uploadDir = '/images/';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    nama_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      isEmail: true,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Duplicate email!'
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Duplicate username!'
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telp_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto_user: {
      type: DataTypes.STRING,
      defaultValue: "",
      // get() {
      //   const foto_user = this.getDataValue('foto_user');
      //   return uploadDir + foto_user
      // }
    },
    foto_ktp: {
      type: DataTypes.STRING,
      defaultValue: "",
      get() {
        const foto_ktp = this.getDataValue('foto_ktp');
        return uploadDir + foto_ktp
      }
    },
    isValid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "belum divalidasi",
      validate: {
        isIn: {
          args: [["belum divalidasi", "sudah divalidasi", "dibuat oleh admin"]],
          msg: "status aduan hanya tersedia 3 pilihan: belum divalidasi, sudah divalidasi atau dibuat oleh admin",
        },
      },
    }
  }, {
    hooks: {
      beforeCreate: async function (user) {
        const salt = await bcrypt.genSaltSync(10);
        if (user.password) {
          user.password = await bcrypt.hashSync(user.password, salt);
        }
        console.log(user.password)
      }
    }
  });
  User.associate = function (models) {
    // associations can be defined here
    // User.hasMany(models.Komentar);
    // User.hasMany(models.Peminjaman_Kunci)
    User.hasMany(models.Aduan_Lapor);
    User.hasMany(models.Aduan_Hilang);
    User.hasMany(models.Notifications)
    User.belongsTo(models.Role);
  };
  return User;
};