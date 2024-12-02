const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Actor } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/actors.csv'); // Mengubah path untuk sesuai struktur

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const actors = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          actors.push({
            name: row.name,
            birth_date: new Date(row.birth_date), // Pastikan tipe data birth_date benar
            photo: row.photo,
            country_id: row.country_id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', async () => {
          try {
            await Actor.bulkCreate(actors, { updateOnDuplicate: ['name', 'birth_date', 'photo'] });
            // console.log('Actors seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding actors:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel actors
    await queryInterface.bulkDelete('actors', null, {});
  }
};
