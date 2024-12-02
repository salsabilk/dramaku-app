// migrations/20240915007000-create-awarddrama.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('award_drama', {
        award_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'awards',
            key: 'id'
          }
        },
        drama_id: {
          type: Sequelize.BIGINT,
          references: {
            model: 'dramas',
            key: 'id'
          }
        }
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('award_drama');
    }
  };
  