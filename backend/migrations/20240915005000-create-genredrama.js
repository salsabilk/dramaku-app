// migrations/20240915005000-create-genredrama.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('genre_drama', {
        drama_id: {
          type: Sequelize.BIGINT,
          references: {
            model: 'dramas',
            key: 'id'
          }
        },
        genre_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'genres',
            key: 'id'
          }
        }
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('genre_drama');
    }
  };
  