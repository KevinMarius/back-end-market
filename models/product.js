'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    detail: DataTypes.STRING,
    photo: DataTypes.BLOB,
    prix: DataTypes.FLOAT,
    categorie: DataTypes.STRING,
    likes: DataTypes.INTEGER
  }, {});
  Product.associate = function(models) {
    // associations can be defined here
    models.Product.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    models.Product.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'productId',
      otherKey: 'userId'
    });

    models.Product.belongsToMany(models.Categorie, {
      through: models.Appartient,
      foreignKey: 'productId',
      otherKey: 'categorieId'
    });
  };
  return Product;
};