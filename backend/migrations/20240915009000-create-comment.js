// migrations/20240915008000-create-comment.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('comments', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        drama_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'dramas',
            key: 'id'
          }
        },
        rate: {
          type: Sequelize.INTEGER(1)
        },
        content: {
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
      await queryInterface.dropTable('comments');
    }
  };
  