module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('actor_drama', {
      actor_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'actors',
          key: 'id'
        },
      },
      drama_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'dramas',
          key: 'id'
        },
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('actor_drama');
  }
};
