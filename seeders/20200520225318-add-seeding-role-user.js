'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const roles = queryInterface.bulkInsert('Roles', [
      {
        id: 1,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 2,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 3,
        role: 'operator umum',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 4,
        role: 'operator akademik',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 5,
        role: 'operator keuangan dan kepegawaian',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 6,
        role: 'operator kemahasiswaan',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 7,
        role: 'satpam',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    const selectRoles = await queryInterface.sequelize.query(`Select * from Role;`);
    console.log(selectRoles)

    const users = queryInterface.bulkInsert('Users', [
      {
        nama_user: 'Ismail Marzuki',
        email: 'ismail123@gmail.com',
        username: 'ismail123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: selectRoles[0].id,
      }, {
        nama_user: 'Raden Ayu Kartinia',
        email: 'kartini123@gmail.com',
        username: 'kartini123',
        password: '123456',
        telp_user: '999',
        foto_user: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: selectRoles[0].id,
      },
      // {
      //     nama_user: 'Admin Ganteng',
      //     email: 'admin123@gmail.com',
      //     username: 'admin.ganteng123',
      //     password: '123456',
      //     telp_user: '999',
      //     foto_user: "",
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //     RoleId: selectRoles[1].id,
      //   }, {
      //     nama_user: 'Operator Umum',
      //     email: 'op.umum123@gmail.com',
      //     username: 'op.umum123',
      //     password: '123456',
      //     telp_user: '999',
      //     foto_user: "",
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //     RoleId: selectRoles[2].id,
      //   }, {
      //     nama_user: 'Operator Akademik',
      //     email: 'op.akademik123@gmail.com',
      //     username: 'op.akademik123',
      //     password: '123456',
      //     telp_user: '999',
      //     foto_user: "",
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //     RoleId: selectRoles[3].id,
      //   }, {
      //     nama_user: 'Operator Keuangan',
      //     email: 'op.keuangan123@gmail.com',
      //     username: 'op.keuangan123',
      //     password: '123456',
      //     telp_user: '999',
      //     foto_user: "",
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //     RoleId: selectRoles[4].id,
      //   }, {
      //     nama_user: 'Operator Kemahasiswaan',
      //     email: 'op.kemahasiswaan123@gmail.com',
      //     username: 'op.kemahasiswaan123',
      //     password: '123456',
      //     telp_user: '999',
      //     foto_user: "",
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //     RoleId: selectRoles[5].id,
      //   }, {
      //     nama_user: 'Satpam',
      //     email: 'satpam123@gmail.com',
      //     username: 'satpam123',
      //     password: '123456',
      //     telp_user: '999',
      //     foto_user: "",
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //     RoleId: selectRoles[6].id,
      //   }
    ], {});


    // return roles, users;
    return roles, users;
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
