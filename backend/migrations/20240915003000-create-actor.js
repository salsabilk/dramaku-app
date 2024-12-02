// migrations/20240915003000-create-actor.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('actors', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        birth_date: {
          type: Sequelize.DATE
        },
        photo: {
          type: Sequelize.TEXT
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
      await queryInterface.dropTable('actors');
    }
  };
  