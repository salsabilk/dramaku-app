// seeders/20230923000000-demo-user.js
'use strict';

const bcrypt = require('bcrypt'); // Tambahkan ini untuk mengimpor bcrypt

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        googleId: null,
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('12345678', 10), // Gunakan await di sini
        role: 'Admin',
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        googleId: null,
        username: 'faris',
        email: 'faris@example.com',
        password: await bcrypt.hash('12345678', 10), // Gunakan await di sini
        role: 'User',
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        googleId: null,
        username: 'sabil',
        email: 'sabil@example.com',
        password: await bcrypt.hash('12345678', 10), // Gunakan await di sini
        role: 'User',
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
