'use strict';
module.exports = (sequelize, DataTypes) => {
  const Appartient = sequelize.define('Appartient', {
      produitId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Product',
        key: 'id'
      }
    },
    categorieId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Categorie',
        key: 'id'
      }
    }
  }, {});
  Appartient.associate = function(models) {
    // associations can be defined here
    models.Product.belongsToMany(models.Categorie, {
      through: models.Appartient,
      foreignKey: 'produitId',
      otherKey: 'categorieId'
    });

    models.Categorie.belongsToMany(models.Product, {
      through: models.Appartient,
      foreignKey: 'categorieId',
      otherKey: 'produitId'
    });

    models.Appartient.belongsTo(models.Categorie, {
      foreignKey: 'categorieId',
      as: 'categorie'
    });

    models.Appartient.belongsTo(models.Product, {
      foreignKey: 'produitId',
      as: 'produit'
    });
  };
  return Appartient;
};