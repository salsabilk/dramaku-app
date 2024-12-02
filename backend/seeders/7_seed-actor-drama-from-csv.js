const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { ActorDrama } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/actor_drama.csv'); // Pastikan path ke CSV benar

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const actorDrams = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const actorId = parseInt(row.actor_id, 10);
          const dramaId = parseInt(row.drama_id, 10);

          // Validasi ID sebelum menambahkannya ke array
          if (actorId && dramaId) {
            actorDrams.push({
              actor_id: actorId,   // Pastikan kolom ini sesuai dengan CSV
              drama_id: dramaId,   // Pastikan kolom ini sesuai dengan CSV
              createdAt: new Date(), // Tambahkan timestamp
              updatedAt: new Date()  // Tambahkan timestamp
            });
          } else {
            console.warn(`Skipping invalid entry with actor_id: ${row.actor_id}, drama_id: ${row.drama_id}`);
          }
        })
        .on('end', async () => {
          try {
            // Insert data langsung ke database dengan menghindari duplikasi
            await ActorDrama.bulkCreate(actorDrams, { ignoreDuplicates: true });
            // console.log('Actor-Drama associations seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding actor-drama associations:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel actor_drama
    await queryInterface.bulkDelete('actor_drama', null, {});
  }
};
