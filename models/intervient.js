'use strict';
module.exports = (sequelize, DataTypes) => {
  const Intervient = sequelize.define('Intervient', {
    conversationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Conversation',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
  }, {});
  Intervient.associate = function(models) {
    // associations can be defined here
    models.User.belongsToMany(models.Conversation, {
      through: models.Intervient,
      foreignKey: 'userId',
      otherKey: 'conversationId'
    });

    models.Conversation.belongsToMany(models.User, {
      through: models.Intervient,
      foreignKey: 'conversationId',
      otherKey: 'userId'
    });

    models.Intervient.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    models.Intervient.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation'
    });
  };
  return Intervient;
};