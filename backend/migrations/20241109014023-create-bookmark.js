module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bookmarks", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      drama_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "dramas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Tambahkan unique constraint untuk mencegah duplikasi bookmark
    await queryInterface.addConstraint("bookmarks", {
      fields: ["user_id", "drama_id"],
      type: "unique",
      name: "unique_user_drama_bookmark",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("bookmarks");
  },
};
