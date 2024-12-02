module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'genres',
    timestamps: true
  });

  Genre.associate = (models) => {
    Genre.belongsToMany(models.Drama, {
      through: models.GenreDrama,
      foreignKey: 'genre_id',
    });
  };

  return Genre;
};
