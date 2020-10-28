'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Data_Pengembalians', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal_pinjam: {
        type: Sequelize.DATEONLY
      },
      tanggal_kembali: {
        type: Sequelize.DATEONLY
      },
      nama_pengembali: {
        type: Sequelize.STRING
      },
      status_pengembalian: {
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Data_Pengembalians');
  }
};