'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Data_Peminjamans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      keperluan: {
        type: Sequelize.STRING
      },
      identitas: {
        type: Sequelize.STRING
      },
      status_peminjaman: {
        type: Sequelize.STRING
      },
      tanggal_pinjam: {
        type: Sequelize.STRING
      },
      tanggal_kembali: {
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
    return queryInterface.dropTable('Data_Peminjamans');
  }
};