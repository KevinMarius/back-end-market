'use strict';


module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    produitId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
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
    isLike: DataTypes.INTEGER
  }, {});
  Like.associate = function(models) {
    // associations can be defined here
    models.User.belongsToMany(models.Product, {
      through: models.Like,
      foreignKey: 'userId',
      otherKey: 'productId'
    });

    models.Product.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'productId',
      otherKey: 'userId'
    });

    models.Like.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    models.Like.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };
  return Like;
};