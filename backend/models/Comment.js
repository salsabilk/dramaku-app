// models/Comment.js
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      drama_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'dramas',
          key: 'id'
        }
      },
      rate: {
        type: DataTypes.INTEGER
      },
      content: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.ENUM('Unapproved', 'Approved', 'Pending'),
        defaultValue: 'Pending'
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }, {
      tableName: 'comments',
      timestamps: true
    });
    
    Comment.associate = (models) => {
      Comment.belongsTo(models.Drama, {
        foreignKey: 'drama_id',
        onDelete: 'CASCADE'
      });
  
      Comment.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
    };

    return Comment;
  };
  