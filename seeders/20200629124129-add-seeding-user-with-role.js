'use strict';
const uploadDir = '/images/';
const uuid = require('uuid').v4;
module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Users', [
      {
        id: 1,
        nama_user: 'Ismail Marzuki',
        email: 'ismail123@gmail.com',
        username: 'ismail123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 1,
      }, {
        id: 2,
        nama_user: 'Raden Ayu Kartinia',
        email: 'kartini123@gmail.com',
        username: 'kartini123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 1,
      }, {
        id: 3,
        nama_user: 'Admin',
        email: 'admin123@gmail.com',
        username: 'admin123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 2,
      }, {
        id: 4,
        nama_user: 'Operator Umum',
        email: 'op.umum123@gmail.com',
        username: 'op.umum123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 3,
      }, {
        id: 5,
        nama_user: 'Operator Akademik',
        email: 'op.akademik123@gmail.com',
        username: 'op.akademik123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 4,
      }, {
        id: 6,
        nama_user: 'Operator Keuangan',
        email: 'op.keuangan123@gmail.com',
        username: 'op.keuangan123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 5,
      }, {
        id: 7,
        nama_user: 'Operator Kemahasiswaan',
        email: 'op.kemahasiswaan123@gmail.com',
        username: 'op.kemahasiswaan123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 6,
      }, {
        id: 8,
        nama_user: 'Satpam',
        email: 'satpam123@gmail.com',
        username: 'satpam123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: 7,
      }
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
