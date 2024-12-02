const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Award } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/awards.csv'); // Pastikan path ke CSV benar

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const awards = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          awards.push({
            name: row.nama,         // Pastikan kolom ini sesuai dengan CSV
            year: row.tahun,       // Pastikan kolom ini sesuai dengan CSV
            country_id: row.country_id, // Pastikan kolom ini sesuai dengan CSV
            createdAt: new Date(),
            updatedAt: new Date()
          });
        })
        .on('end', async () => {
          try {
            await Award.bulkCreate(awards, { updateOnDuplicate: ['name', 'year', 'country_id'] });
            // console.log('Awards seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding awards:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel awards
    await queryInterface.bulkDelete('awards', null, {});
  }
};
