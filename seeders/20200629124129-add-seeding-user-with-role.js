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
        id: uuid(),
        nama_user: 'Ismail Marzuki',
        email: 'ismail123@gmail.com',
        username: 'ismail123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Raden Ayu Kartinia',
        email: 'kartini123@gmail.com',
        username: 'kartini123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Admin',
        email: 'admin123@gmail.com',
        username: 'admin123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Operator Umum',
        email: 'op.umum123@gmail.com',
        username: 'op.umum123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Operator Akademik',
        email: 'op.akademik123@gmail.com',
        username: 'op.akademik123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Operator Keuangan',
        email: 'op.keuangan123@gmail.com',
        username: 'op.keuangan123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Operator Kemahasiswaan',
        email: 'op.kemahasiswaan123@gmail.com',
        username: 'op.kemahasiswaan123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: uuid(),
        nama_user: 'Satpam',
        email: 'satpam123@gmail.com',
        username: 'satpam123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        RoleId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
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
