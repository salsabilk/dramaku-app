// models/AwardDrama.js
module.exports = (sequelize, DataTypes) => {
    const AwardDrama = sequelize.define('AwardDrama', {
      award_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'awards',
          key: 'id'
        }
      },
      drama_id: {
        type: DataTypes.BIGINT,
        references: {
          model: 'dramas',
          key: 'id'
        }
      }
    }, {
      tableName: 'award_drama',
      timestamps: false,
      define: {
        noPrimaryKey: true,
      },
    });
    AwardDrama.removeAttribute('id');
    return AwardDrama;
  };
  