// migrations/20240915002000-create-genre.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('genres', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(25),
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
      await queryInterface.dropTable('genres');
    }
  };
  