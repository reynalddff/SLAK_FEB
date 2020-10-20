'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSaltSync(10);
    return queryInterface.bulkInsert('Kuncis', [
      {
        id: uuidv4(),
        nama_ruangan: "Ruang Rapat 01",
        status_kunci: "tersedia",
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: uuidv4(),
        nama_ruangan: "Ruang Rapat 02",
        status_kunci: "tersedia",
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        id: uuidv4(),
        nama_ruangan: "Ruang Rapat 03",
        status_kunci: "tersedia",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
