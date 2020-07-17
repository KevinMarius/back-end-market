'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    from: DataTypes.STRING,
    conversationId: DataTypes.INTEGER,
    content: DataTypes.STRING
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
    models.Message.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation'
    });
  };
  return Message;
};