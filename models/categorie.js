'use strict';
module.exports = (sequelize, DataTypes) => {
  const Categorie = sequelize.define('Categorie', {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Categorie.associate = function(models) {
    // associations can be defined here 
    models.Categorie.belongsToMany(models.Product, {
      through: models.Appartient,
      foreignKey: 'categorieId',
      otherKey: 'productId'
    });
  };
  return Categorie;
};