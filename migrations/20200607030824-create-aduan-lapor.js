'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Aduan_Lapors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul_aduan: {
        type: Sequelize.STRING
      },
      deskripsi_aduan: {
        type: Sequelize.STRING
      },
      lokasi_aduan: {
        type: Sequelize.STRING
      },
      tujuan_aduan: {
        type: Sequelize.INTEGER
      },
      status_aduan: {
        type: Sequelize.STRING
      },
      foto_aduan: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Aduan_Lapors');
  }
};