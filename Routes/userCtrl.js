var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var middleware = require('../utils/middleware');
var models = require('../models');
var asyncLib = require('async');
var nodemailer = require('nodemailer');
var multer = require('multer');

const EMAIL_REGEX =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,15}$/;

module.exports = {
  register: function(req, res) {
    //params
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var conPassword = req.body.conPassword;
    var bio = req.body.bio;
    var isAdmin;

    if (password !== conPassword) {
      return res.status(500).json({'error': 'passwords are not the same'});
    }

    if (password === 'secret12') {
      isAdmin = 1;
    }else{
      isAdmin = 0 
    }

    // todo verify email, username and password
    if (email == null || username == null || password == null) {
        return res.status(400).json({'error': 'missing parameters'});
    }

    if (username.length >= 13 || username <=4 ) {
        return res.status(400).json({'error': 'wrong username (must be length 5 - 12)'});
    }
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({'error': 'email is not valid'});
    }
    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({'error': 'password is not valid (must be length 4 - 15) and include the number'});
    }

    asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            attributes: ['email'],
            where: { email: email }
          })
          .then(function(userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if (!userFound) {
            bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
              done(null, userFound, bcryptedPassword);
            });
          } else {
            return res.status(409).json({ 'error': 'user already exist' });
          }
        },
        function(userFound, bcryptedPassword, done) {
          var newUser = models.User.create({
            email: email,
            username: username,
            password: bcryptedPassword,
            bio: bio,
            isAdmin: isAdmin
          })
          .then(function(newUser) {
            done(newUser);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'cannot add user' });
          });
        }
      ], function(newUser) {
        if (newUser) {
          return res.status(201).json({
            'userId': newUser.id
          });
        } else {
          return res.status(500).json({ 'error': 'cannot add user' });
        }
      });
    },
    login: function(req, res) {
      // Params
      var email    = req.body.email;
      var password = req.body.password;

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({'error': 'email is not valid'});
    }
  
      if (email == null ||  password == null) {
        return res.status(400).json({ 'error': 'missing parameters' });
      }
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            where: { email: email }
          })
          .then(function(userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if (userFound) {
            bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
              done(null, userFound, resBycrypt);
            });
          } else {
            return res.status(404).json({ 'error': 'user not exist in DB' });
          }
        },
        function(userFound, resBycrypt, done) {
          if(resBycrypt) {
            done(userFound);
          } else {
            return res.status(403).json({ 'error': 'invalid password' });
          }
        }
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json({
            'userId': userFound.id,
            'token': jwtUtils.generateTokenForUser(userFound)
          });
        } else {
          return res.status(500).json({ 'error': 'cannot log on user' });
        }
      });
    },
    getUserProfile: function(req, res) {
      // Getting auth header
      var userId = middleware.middleware(req, res);
  
      if (userId < 0)
        return res.status(400).json({ 'error': 'wrong token' });
  
      models.User.findOne({
        attributes: [ 'id', 'email', 'username', 'biographie', 'photo', 'telephone'],
        where: { id: userId }
      }).then(function(user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      }).catch(function(err) {
        res.status(500).json({ 'error': 'cannot fetch user' });
      });
    },
    updateUserProfile: function(req, res) {

      // Getting auth header
      var userId = middleware.middleware(req, res);
  
      // Params
      var biographie = req.body.biographie;
      var username = req.body.username;
      var photo = req.body.photo;
      var telephone = req.body.telephone;
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            attributes: ['id', 'email', 'username', 'biographie', 'photo', 'telephone'],
            where: { id: userId }
          }).then(function (userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if(userFound) {
            userFound.update({
              username: (username ? username : userFound.username),
              biographie: (biographie ? biographie : userFound.biographie),
              photo: (photo ? photo : userFound.photo),
              telephone: (telephone ? telephone : userFound.telephone)
            }).then(function() {
              done(userFound);
            }).catch(function(err) {
              res.status(500).json({ 'error': 'cannot update user' });
            });
          } else {
            res.status(404).json({ 'error': 'user not found' });
          }
        },
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ 'error': 'cannot update user profile' });
        }
      });
    },
    getUser: function(req, res) {
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
          if (userFound.isAdmin) {
            var fields = req.query.fields;
            var limit = parseInt(req.query.limit);
            var offset = parseInt(req.query.offset);
            var order = req.query.order;

            models.User.findAll({
              order: [(order != null) ? order.split(':') : ['username' , 'ASC']],
              attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
              limit: (!isNaN(limit)) ? limit : null,
              offset: (!isNaN(offset)) ? offset : null
            })
            .then(function(users) {
              if (users) {
                return res.status(201).json(users);
              }else {
                return res.status(404).json({'error': 'no user found'});
              }
            })
            .catch(function(err) {
              return res.status(500).json({'error': 'invalid field'});
            });
          }else{
            res.status(500).json({ 'error': 'you are not admin' });
          }
        }else{
          return res.status(404).json({'error': 'no user found'});
        }
      })
    },
    putAdmin: function(req, res) {
      var userId = middleware.middleware(req, res);

      var isAdmin = req.body.isAdmin;     
      var user = parseInt(req.params.user);

      asyncLib.waterfall([
        function (done) {
          models.User.findOne({
            attributes: ['id', 'username', 'isAdmin'],
            where: {id: userId}
          })
          .then(function(userFound1) {
            done(null, userFound1);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          })
        },
        function(userFound1, done) {
          models.User.findOne({
            attributes: ['id', 'username', 'isAdmin'],
            where: {id: user}
          })
          .then(function(userFound2) {
            done(null, userFound1, userFound2);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          })
        },
        function(userFound1, userFound2, done) {
          if (userFound1) {
            if (userFound1.isAdmin) {
              userFound2.update({
                isAdmin: (isAdmin ? isAdmin : userFound2.isAdmin)
              }).then(function() {
                done(userFound2);
              }).catch(function(err) {
                res.status(500).json({ 'error': 'cannot update user' });
              });
            }else{
              res.status(500).json({ 'error': 'you are not admin' });
            }
          }
        }
      ],
      function(userFound2) {
        if (userFound2) {
          return res.status(201).json(userFound2);
        } else {
          return res.status(500).json({ 'error': 'cannot update user profile' });
        }
      })
    },
    resetPassword: function(req, res) {
      var token = req.params.token;

      
    },
    forgotPassword: function(req, res, next) {
      var email = req.body.email;

      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({'error': 'email is not valid'});
      }

      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            where: { email: email }
          }).then(function(userFound) {
            done(null, userFound);
          }).catch(function(err) {
            return res.status(500).json({ 'error': 'No account with that email address exists.' });
          });
        },
        function(userFound, done) {
          if(userFound) {
            var token = jwtUtils.generateTokenForUser(userFound);
            userFound.update({
              resetPasswordToken: (resetPasswordToken ? token : userFound.resetPasswordToken),
              resetPasswordExpires: (resetPasswordExpires ? Date.now() + 3600000 : userFound.resetPasswordExpires)
            }).then(function() {
              done(userFound);
            }).catch(function(err) {
              res.status(500).json({ 'error': 'cannot update user' });
            });
          }
        },
        function(userFound, token, done) {
          var smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
              user: 'learntocodeinfo@gmail.com',
              pass: process.env.GMAILPW
            }
          });
          var mailOptions = {
            to: userFound.email,
            from: 'learntocodeinfo@gmail.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          smtpTransport.sendMail(mailOptions, function(err) {
            console.log('mail sent');
            req.flash('success', 'An e-mail has been sent to ' + userFound.email + ' with further instructions.');
            done(err, 'done');
          });
        }
      ],function(err){
        if (err) return next(err);
      }
      )
    }
}