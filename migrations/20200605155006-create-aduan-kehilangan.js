'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Aduan_Kehilangans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      judul_hilang: {
        type: Sequelize.STRING
      },
      deskripsi_hilang: {
        type: Sequelize.STRING
      },
      lokasi_hilang: {
        type: Sequelize.STRING
      },
      foto_hilang: {
        type: Sequelize.STRING
      },
      tanggal_hilang: {
        type: Sequelize.DATE
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
    return queryInterface.dropTable('Aduan_Kehilangans');
  }
};