const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Genre } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/genres.csv'); // Mengubah jalur file agar lebih tepat

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const genres = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          genres.push({
            name: row.nama, // Pastikan kolom CSV benar (nama, bukan name)
            createdAt: new Date(),
            updatedAt: new Date()
          });
        })
        .on('end', async () => {
          try {
            await Genre.bulkCreate(genres, { updateOnDuplicate: ['name'] });
            // console.log('Genres seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding genres:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel genres
    await queryInterface.bulkDelete('genres', null, {});
  }
};
