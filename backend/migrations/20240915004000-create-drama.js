// migrations/20240915004000-create-drama.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('dramas', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        poster: {
          type: Sequelize.TEXT
        },
        alt_title: {
          type: Sequelize.STRING(255)
        },
        year: {
          type: Sequelize.INTEGER(4)
        },
        country_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'countries',
            key: 'id'
          }
        },
        synopsis: {
          type: Sequelize.TEXT
        },
        availability: {
          type: Sequelize.STRING(255)
        },
        link_trailer: {
          type: Sequelize.TEXT
        },
        status: {
          type: Sequelize.ENUM('Unapproved', 'Approved', 'Pending'),
          defaultValue: 'Pending'
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
      await queryInterface.dropTable('dramas');
    }
  };
  