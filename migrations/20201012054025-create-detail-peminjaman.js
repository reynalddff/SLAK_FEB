'use strict';
module.exports = {
<<<<<<< HEAD:migrations/20201027181208-create-detail-peminjaman.js
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Detail_Peminjamans', {
=======
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Detail_Peminjamans', {
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221:migrations/20201012054025-create-detail-peminjaman.js
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
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
<<<<<<< HEAD:migrations/20201027181208-create-detail-peminjaman.js
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Detail_Peminjamans');
=======
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Detail_Peminjamans');
>>>>>>> 545070e64a206e6c75356f6f5aaab26b2fe65221:migrations/20201012054025-create-detail-peminjaman.js
  }
};