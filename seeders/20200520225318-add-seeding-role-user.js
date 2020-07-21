'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {
        id: 8,
        role: 'kasubbag',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // }, {
      //   id: 2,
      //   role: 'admin',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }, {
      //   id: 3,
      //   role: 'operator umum',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }, {
      //   id: 4,
      //   role: 'operator akademik',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }, {
      //   id: 5,
      //   role: 'operator keuangan dan kepegawaian',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }, {
      //   id: 6,
      //   role: 'operator kemahasiswaan',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }, {
      //   id: 7,
      //   role: 'satpam',
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }
    ], {});
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
