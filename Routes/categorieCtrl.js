var middleware = require('../utils/middleware');
var models = require('../models');
var asyncLib = require('async');

module.exports = {
  createCategorie: function(req, res) {
    var name = req.body.name;
    var description = req.body.description;

    var userId = middleware.middleware(req, res);

    if (name == null) {
      return res.status(400).json({'error': 'missing parameters'});
    }
    if (name.length >= 20 || name.length <=3 ) {
      return res.status(400).json({'error': 'wrong username (must be length 3 - 20)'});
    }    
    if (userId < 0){
      return res.status(400).json({ 'error': 'wrong token' });
    }

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'username', 'isAdmin'],
          where: {id: userId}
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        })
      },
      function(userFound, done) {
        models.Categorie.findOne({
          attributes: ['name'],
          where: { name: name }
        })
        .then(function(categorieFound) {
          done(null, categorieFound, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify categorie' });
        });
      },
      function(categorieFound, userFound, done) {
        if (userFound) {
          if (userFound.isAdmin) {
            if (!categorieFound) {
              var newCategorie = models.Categorie.create({
                name: name,
                description: description,
              })
              .then(function(newCategorie) {
                done(newCategorie);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'cannot add categorie' });
              });
            }else {
              return res.status(409).json({ 'error': 'categorie already exist' });
            }
          }else{
            return res.status(500).json({ 'error': 'you are not admin' });
          }
        } else{
          return res.status(409).json({ 'error': 'user not found' });
        }
      }
    ],
    function(newCategorie) {
      if (newCategorie) {
        return res.status(201).json({
          'categorieId': newCategorie.id
        })
      }else {
        return res.status(500).json({ 'error': 'cannot add categorie' });
      }
    })    
  },
  listCategorie: function(req, res) {
    var userId = middleware.middleware(req, res); 

    var fields = req.query.fields;
    var limit = parseInt(req.query.limit);
    var offset = parseInt(req.query.offset);
    var order = req.query.order;

    models.Categorie.findAll({
      order: [(order != null) ? order.split(':') : ['name' , 'ASC']],
      attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
      limit: (!isNaN(limit)) ? limit : null,
      offset: (!isNaN(offset)) ? offset : null
    })
    .then(function(categories) {
      if (categories) {
        return res.status(200).json(categories);
      }else {
        return res.status(404).json({'error': 'no categorie found'});
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({'error': 'invalid field'});
    });
  },
  updateCategorie: function(req, res) {
    var userId = middleware.middleware(req, res);

    // Params
    var name = req.body.name;
    var description = req.body.description;

    var categorieId = parseInt(req.params.categorieId);

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['id', 'username', 'isAdmin'],
          where: {id: userId}
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        })
      },
      function(userFound, done) {
        models.Categorie.findOne({
          attributes: ['id', 'name', 'description'],
          where: { id: categorieId }
        })
        .then(function(categorieFound) {
          done(null, categorieFound, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify categorie' });
        });
      },
      function(categorieFound, userFound, done) {
        if(categorieFound) {
          if (userFound.isAdmin) {
            categorieFound.update({
              name: (name ? name : categorieFound.name),
              description: (description ? description : categorieFound.description)
            }).then(function() {
              done(categorieFound);
            }).catch(function(err) {
              res.status(500).json({ 'error': 'cannot update categorie' });
            });
          }else{
            res.status(500).json({ 'error': 'user is not admin' });
          }  
        } else {
          res.status(404).json({ 'error': 'categorie not found' });
        }
      },
    ], function(categorieFound) {
      if (categorieFound) {
        return res.status(201).json(categorieFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update categorie' });
      }
    });
  },
  deleteCategorie: function(req, res) {
    var userId = middleware.middleware(req, res);
    var categorieId = parseInt(req.params.categorieId);

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          where: {id: userId}
        }).then(function(userFound) {
          done(userFound);
        }).catch(function(err) {
          res.status(400).json({'error': 'user not exist'});
        })
      },
      function(userFound, done) {
        if (userFound.isAdmin) {
          models.Categorie.destroy({
            where: {id: categorieId}
          })
          .then(function() {
            return res.status(200).json({'OK': 'remove successfull'});
          })
          .catch(function(err) {
            res.status(500).json({ 'error': 'cannot remove categorie' });
          });
        }else{
          res.status(500).json({'error': 'user is not admin'})
        }
      }
    ],
    function() {
        return res.status(201).json('OK');
    })
  }
}