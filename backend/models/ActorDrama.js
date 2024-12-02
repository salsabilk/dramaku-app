// models/ActorDrama.js
module.exports = (sequelize, DataTypes) => {
  const ActorDrama = sequelize.define(
    "ActorDrama",
    {
      actor_id: {
        type: DataTypes.BIGINT,
        references: {
          model: "actors",
          key: "id",
        },
      },
      drama_id: {
        type: DataTypes.BIGINT,
        references: {
          model: "dramas",
          key: "id",
        },
      },
    },
    {
      tableName: "actor_drama",
      timestamps: false,
      define: {
        noPrimaryKey: true,
      },
    }
  );
  ActorDrama.removeAttribute('id');
  return ActorDrama;
};
