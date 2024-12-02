const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Country } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/countries.csv');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const countries = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          countries.push({
            name: row.name, // Hanya masukkan kolom yang diperlukan
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', async () => {
          try {
            await Country.bulkCreate(countries, { updateOnDuplicate: ['name'] });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel countries
    await queryInterface.bulkDelete('countries', null, {});
  }
};
