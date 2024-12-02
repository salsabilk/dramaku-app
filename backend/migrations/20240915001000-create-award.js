// migrations/20240915001000-create-award.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('awards', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        year: {
          type: Sequelize.INTEGER(4),
          allowNull: false
        },
        country_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'countries',
            key: 'id'
          }
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('awards');
    }
  };
  