const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { GenreDrama, Genre } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/genre_drama.csv'); // Pastikan jalur ke CSV benar

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const genreDrams = [];

    // Ambil semua genre_id yang valid
    const genres = await Genre.findAll({ attributes: ['id'] });
    const validGenreIds = new Set(genres.map(genre => genre.id));

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const genre_id = parseInt(row.genre_id, 10);
          if (validGenreIds.has(genre_id)) {
            genreDrams.push({
              drama_id: row.drama_id,  // Pastikan kolom ini sesuai dengan CSV
              genre_id: genre_id,      // Pastikan kolom ini sesuai dengan CSV
              createdAt: new Date(),   // Tambahkan timestamp
              updatedAt: new Date()    // Tambahkan timestamp
            });
          } else {
            console.warn(`Invalid genre_id ${genre_id} found in CSV`);
          }
        })
        .on('end', async () => {
          try {
            // Bulk insert dengan mengabaikan duplikasi
            await GenreDrama.bulkCreate(genreDrams, { ignoreDuplicates: true });
            // console.log('Genre-Drama associations seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding genre-drama associations:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel genre_drama
    await queryInterface.bulkDelete('genre_drama', null, {});
  }
};
