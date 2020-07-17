'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    photo: DataTypes.BLOB,
    biographie: DataTypes.STRING,
    telephone: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    isAdmin: DataTypes.BOOLEAN
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    models.User.hasMany(models.Product);

    models.User.belongsToMany(models.Product, {
      through: models.Like,
      foreignKey: 'userId',
      otherKey: 'productId'
    });

    models.User.belongsToMany(models.Conversation, {
      through: models.Intervient,
      foreignKey: 'userId',
      otherKey: 'conversationId'
    });
  };
  return User;
};