// imports
var middleware = require('../utils/middleware');
var models = require('../models');
var asyncLib = require('async');

// constants
var NAME_MAX = 15;
var NAME_MIN = 2;

// routes
module.exports = {
  getProduct: function(req, res) {
    var userId = middleware.middleware(req, res);

      asyncLib.waterfall([
        function (done) {
          models.User.findOne({
            attributes: ['id', 'username', 'isAdmin'],
            where: {id: userId}
          })
          .then(function(userFound) {
            done(userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          })
        },
      ],
      function(userFound) {
        if (userFound) {
            var fields = req.query.fields;
            var limit = parseInt(req.query.limit);
            var offset = parseInt(req.query.offset);
            var order = req.query.order;

            models.Product.findAll({
              order: [(order != null) ? order.split(':') : ['name' , 'ASC']],
              attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
              limit: (!isNaN(limit)) ? limit : null,
              offset: (!isNaN(offset)) ? offset : null
            })
            .then(function(products) {
              if (products) {
                return res.status(201).json(products);
              }else {
                return res.status(404).json({'error': 'no product found'});
              }
            })
            .catch(function(err) {
              return res.status(500).json({'error': 'invalid field'});
            });
        }else{
          return res.status(404).json({'error': 'no user found'});
        }
      })
  },
  showProduct: function(req, res) {
    var userId = middleware.middleware(req, res);
    var productId = parseInt(req.params.productId);

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'username', 'isAdmin'],
          where: {id: userId}
        }).then(function(userFound) {
          done(null, userFound);
        }).catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        })
      },
      function(userFound, done) {
        if (userFound) {
          models.Product.findOne({
            where: {id: productId}
          }).then(function(productFound) {
            done(productFound)
          }).catch(function(err) {
            return res.status(500).json({ 'error': "product not exis't" });
          })
        }else{
          return res.status(404).json({'error': 'no user found'});
        }
      }
    ],
    function(productFound) {
      if (productFound) {
        return res.status(201).json(productFound);
      }
    })
  },
  createProduct: function(req, res) {
    var userId = middleware.middleware(req, res);

    var name = req.body.name;
    var detail = req.body.detail;
    var photo = req.body.photo;
    var prix = req.body.prix;
    var categorieId = parseInt(req.body.categorieId);

    if (name == null || detail == null || photo == null || prix==null) {
      return res.status(400).json({'error': 'missing parameters'});
    } 

    if (name.length >= NAME_MAX || name.length <= NAME_MIN ) {
        return res.status(400).json({'error': 'wrong username (must be length 3 - 15)'});
    }

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'username', 'isAdmin'],
          where: {id: userId}
        }).then(function(userFound) {
          done(null, userFound);
        }).catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        });
      },
      function(userFound, done) {
        if (userFound) {
          models.Categorie.findOne({
            where: { id: categorieId }
          }).then(function(categorieFound) {
            done(null, userFound, categorieFound);
          }).catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify categorie' });
          });
        }
      },
      function(userFound, categorieFound, done) {
        if (categorieFound) {
            var newProduct = models.Product.create({
              name: name,
              userId: userId,
              detail: detail,
              photo: photo,
              prix: prix,
              categorie: categorieFound.name,
              likes: 0
            }).then(function(newProduct) {
              done(null, userFound, categorieFound, newProduct);
            }).catch(function(err) {
              return res.status(500).json({'error': 'cannot add product'});
            })
        } else {
          return res.status(409).json({ "error": "user don't exist" });
        }
      },
      function( userFound, categorieFound, newProduct, done) {
        if (newProduct && categorieFound) {
          var newAppartient = models.Appartient.create({
            produitId: newProduct.id,
            categorieId: categorieFound.id
          }).then(function(newAppartient) {
            done(userFound , newAppartient)
          }).catch(function(err) {
            return res.status(500).json({'error': 'cannot add appartient'});
          })
        }
      }
    ], function(newProduct) {
      if (newProduct) {
        return res.status(201).json({
          'productId': newProduct
        })
      }else {
        return res.status(500).json({ 'error': 'cannot add product' });
      }
    })
  },
  updateProduct: function(req, res) {
    var userId = middleware.middleware(req, res);
    var name = req.body.name;
    var detail = req.body.detail;
    var photo = req.body.photo;
    var prix = req.body.prix;
    var categorieId = parseInt(req.body.categorieId);

    asyncLib.waterfall([
      function(done) {
        models.Product.findOne({
          attributes: ['name', 'userId', 'detail'],
          where: {userId: userId}
        }).then(function(productFound) {
          done(null, productFound);
        }).catch(function(err) {
          return res.status(500).json({ 'error': 'product not belongs to user' });
        })
      },
      function(done, userFound) {
        if (userFound) {
          models.Categorie.findOne({
            attributes: ['id', 'name'],
            where: { id: categorieId }
          }).then(function(categorieFound) {
            done(null, categorieFound, userFound);
          }).catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify categorie' });
          });
        }
      },
      function(categorieFound, userFound, productFound) {
        if(categorieFound && productFound){
          models.Appartient.create({
            where: { produitId: productFound.id, categorieId: categorieId}
          }).then(function(appartientFound) {
            done(null, categorieFound, userFound, appartientFound);
          }).catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify categorie' });
          });
        }
      },
        function (done, appartientFound) {
          if(appartientFound) {
            models.Appartient.destroy({
              where: {id: appartientFound.id}
            })
            .then(function() {
              console.log('appartient bien supprime')
            })
            .catch(function(err) {
              res.status(500).json({ 'error': 'cannot remove product' });
            });
          }
        },
      function(productFound, done, categorieFound) {
        models.User.findOne({
          attributes: ['id', 'username'],
          where: {id: userId}
        }).then(function(userFound) {
          done(null, userFound, productFound);
        }).catch(function(err) {
          return res.status(500).json({ 'error': 'product not belongs to user' });
        })
      },
      function(productFound, userFound, done) {
        if (productFound || userFound.isAdmin) {
          productFound.update({
            name: (name ? name : productFound.name),
            detail: (detail ? detail : productFound.detail),
            photo: (photo ? photo : productFound.photo),
            prix: (prix ? prix : productFound.prix),
            categorie: (categorie ? categorie : productFound.categorie),
          }).then(function() {
            done(productFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update product' });
          });
        }else{
          return res.status(409).json({ "error": "product not exit's or this product not belongs to user" });
        }
      }
    ],
    function(productFound) {
      if (productFound) {
        return res.status(201).json(productFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update product' });
      }
    })
  },
  deleteProduct: function(req, res) {
      var userId = middleware.middleware(req, res);
      var productId = parseInt(req.params.productId);
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            where: {id: userId}
          }).then(function(userFound) {
            done(null, userFound);
          }).catch(function(err) {
            res.status(400).json({'error': 'user not exist'});
          })
        },
        function(userFound ,done) {
          models.Product.findOne({
            where: {id: productId}
          }).then(function(productFound) {
            done(null, productFound);
          }).catch(function(err) {
            res.status(400).json({'error': 'product not exist'});
          })
        },
        function(productFound ,userFound, done) {
          if (userFound.isAdmin || productFound) {
            models.Product.destroy({
              where: {id: productId}
            })
            .then(function() {
              return res.status(200).json({'OK': 'remove successfull'});
            })
            .catch(function(err) {
              res.status(500).json({ 'error': 'cannot remove product' });
            });
          }else{
            res.status(500).json({'error': 'user is not admin or this product not belongs to user'})
          }
        }
      ],
      function() {
          return res.status(201).json('OK');
      })
  }
}