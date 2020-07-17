'use strict';
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
  }, {});
  Conversation.associate = function(models) {
    // associations can be defined here
    models.Conversation.hasMany(models.Message);

    models.Conversation.belongsToMany(models.User, {
      through: models.Intervient,
      foreignKey: 'conversationId',
      otherKey: 'userId'
    });
  };
  return Conversation;
};