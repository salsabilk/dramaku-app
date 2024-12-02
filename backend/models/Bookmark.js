module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define(
    "Bookmark",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      drama_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "dramas",
          key: "id",
        },
      },
    },
    {
      tableName: "bookmarks",
      timestamps: true,
    }
  );

  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.User, {
      foreignKey: "user_id",
    });
    Bookmark.belongsTo(models.Drama, {
      foreignKey: "drama_id",
    });
  };

  return Bookmark;
};
