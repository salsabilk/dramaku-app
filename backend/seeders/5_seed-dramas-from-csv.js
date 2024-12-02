const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Drama } = require('../models'); // Sesuaikan dengan lokasi model Anda

const csvFilePath = path.join(__dirname, '/data/dramas.csv'); // Pastikan path ke CSV benar

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dramas = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          dramas.push({
            title: row.judul,                 
            poster: row.poster,               
            alt_title: row.alt_judul,         
            year: row.tahun,                  
            country_id: row.negara_id,        
            synopsis: row.sinopsis,           
            availability: row.availability,    
            link_trailer: row.linktrailer,    
            status: row.status,                
            createdAt: new Date(),
            updatedAt: new Date()
          });
        })
        .on('end', async () => {
          try {
            await Drama.bulkCreate(dramas, { updateOnDuplicate: ['title', 'poster', 'alt_title', 'year', 'country_id', 'synopsis', 'availability', 'link_trailer', 'status'] });
            // console.log('Dramas seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding dramas:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus semua data dari tabel dramas
    await queryInterface.bulkDelete('dramas', null, {});
  }
};
