'use strict';
const moment = require('moment')
module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define('Notifications', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    layananId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    jenis_notif: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['aduan layanan', 'peminjaman kunci', 'aduan barang hilang', 'survey']],
          msg: 'jenis notif tidak valid'
        }
      }
    },
    deskripsi_notif: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tujuan_notif: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('createdAt')).format('DD/MM/YYYY h:mm:ss');
      }
    },
    updatedAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('updatedAt')).format('DD/MM/YYYY h:mm:ss');
      }
    }
  }, {});
  Notifications.associate = function (models) {
    // associations can be defined here
    Notifications.belongsTo(models.User)
  };
  return Notifications;
};