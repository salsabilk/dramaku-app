const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Comment } = require('../models'); // Adjust the path as necessary

const csvFilePath = path.join(__dirname, '/data/comment.csv'); // Ensure the path to the CSV is correct

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const comments = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          comments.push({
            user_id: parseInt(row.user_id, 10),
            drama_id: parseInt(row.drama_id, 10),
            rate: parseInt(row.rate, 10),
            content: row.content,
            status: row.status,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', async () => {
          try {
            // Bulk insert with ignoring duplicates
            await Comment.bulkCreate(comments, { ignoreDuplicates: true });
            // console.log('Comments seeded successfully');
            resolve();
          } catch (error) {
            console.error('Error seeding comments:', error);
            reject(error);
          }
        });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all data from the comments table
    await queryInterface.bulkDelete('comments', null, {});
  }
};
