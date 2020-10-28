'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Data_Pengembalians', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal_pinjam: {
        type: Sequelize.STRING
      },
      tanggal_kembali: {
        type: Sequelize.STRING
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Data_Pengembalians');
  }
};