'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Data_Peminjamans', {
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
        type: Sequelize.DATEONLY
      },
      tanggal_kembali: {
        type: Sequelize.DATEONLY
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Data_Peminjamans');
  }
};