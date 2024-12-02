const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { AwardDrama } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/award_drama.csv'); // Pastikan path ke CSV benar

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const awardDrams = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          awardDrams.push({
            award_id: row.award_id,   // Pastikan kolom ini sesuai dengan CSV
            drama_id: row.drama_id,   // Pastikan kolom ini sesuai dengan CSV
            createdAt: new Date(),     // Tambahkan timestamp
            updatedAt: new Date()      // Tambahkan timestamp
          });
        })
        .on('end', async () => {
          try {
            // Insert data langsung ke database tanpa validasi
            await AwardDrama.bulkCreate(awardDrams);
            // console.log('Award-Drama associations seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding award-drama associations:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel award_drama
    await queryInterface.bulkDelete('award_drama', null, {});
  }
};
