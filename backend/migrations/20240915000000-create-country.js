// migrations/20240915000000-create-country.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('countries', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
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
      await queryInterface.dropTable('countries');
    }
  };
  