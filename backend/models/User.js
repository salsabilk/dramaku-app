// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      photo: {
        type: DataTypes.TEXT,
      },
      googleId: { type: DataTypes.TEXT },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM("Admin", "User"),
        defaultValue: "User",
      },
      is_suspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verification_token: {
        type: DataTypes.STRING,
      },
      reset_password_token: {
        type: DataTypes.STRING,
      },
      reset_password_expires: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Comment, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    User.belongsToMany(models.Drama, {
      through: models.Bookmark,
      foreignKey: "user_id",
    });
  };

  return User;
};
