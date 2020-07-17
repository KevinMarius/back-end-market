var models = require('../models');
var asyncLib = require('async');
var middleware = require('../utils/middleware');

const DISLIKED = 0;
const LIKED = 1;

module.exports = {
  likePost: function(req, res){
    var userId = middleware.middleware(req, res);

    var productId = parseInt(req.params.productId);

    if (productId <= 0) {
        return res.status(400).json({'error': 'invalid params'});
    }

    asyncLib.waterfall([
        function (done) {
            models.Product.findOne({
                where: {id: productId}
            })
            .then(function(productFound) {
                done(null, productFound);
            })
            .catch(function(err) {
                return res.status(500).json({'error': 'unable to verify product'});
            });
        },
        function(productFound, done) {
            if (productFound) {
                models.User.findOne({
                    where: {id: userId}
                })
                .then(function(userFound) {
                    done(null, productFound, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'error': 'unable to verify user'});
                });
            }else {
                return res.status(404).json({'error': 'post already like'});
            }
        },
        function(productFound, userFound, done) {
            if (userFound) {
                models.Like.findOne({
                    where: {
                        userId: userId,
                        produitId: productId
                    }
                })
                .then(function(userAlreadyLike) {
                    done(null, productFound, userFound, userAlreadyLike);
                })
                .catch(function(err) {
                    return res.status(500).json({'error': 'unable to verify is user already liked'});
                });
            }else {
                return res.status(404).json({'error': 'user not exist'});
            }
        },
        function(productFound, userFound, userAlreadyLikedFound, done) {
            if (!userAlreadyLikedFound) {
                productFound.addUser(userFound, { isLike: LIKED })
                .then(function(alreadyLikeFound) {
                    done(null, productFound, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({'error': 'unable to set user reaction'});
                });
            }else {
                if(userAlreadyLikedFound.isLike === DISLIKED) {
                    userAlreadyLikedFound.update({
                        isLike: LIKED,
                    })
                    .then(function() {
                        done(null, productFound, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error': 'cannot update user reaction'});
                    });
                }else {
                    return res.status(409).json({'error': 'product already liked'});
                }
            }
        },
        function(productFound, userFound, done) {
            productFound.update({
                likes: productFound.likes + 1,
            })
            .then(function() {
                done(productFound);
            })
            .catch(function(err) {
                return res.status(500).json({'error': 'cannot update product like counter'});
            });
        },
    ],  function(productFound) {
            if(productFound) {
                return res.status(201).json(productFound);
            }else {
                return res.status(500).json({'error': 'cannot update product'});
            }
        });
  },
	dislikePost: function(req, res) {
			// Getting auth header
            var userId = middleware.middleware(req, res);

            var productId = parseInt(req.params.productId);
	 
			if (productId <= 0) {
				return res.status(400).json({ 'error': 'invalid parameters' });
			}
	 
			asyncLib.waterfall([
			 function(done) {
					models.Product.findOne({
						where: { id: productId }
					})
					.then(function(productFound) {
						done(null, productFound);
					})
					.catch(function(err) {
						return res.status(500).json({ 'error': 'unable to verify product' });
					});
				},
				function(productFound, done) {
					if(productFound) {
						models.User.findOne({
                            where: {id: userId}
                        })
                        .then(function(userFound) {
                            done(null, productFound, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({'error': 'unable to verify user'});
                        });
					} else {
						res.status(404).json({ 'error': 'post already liked' });
					}
				},
				function(productFound, userFound, done) {
					if(userFound) {
						models.Like.findOne({
							where: {
								userId: userId,
								messageId: messageId
							}
						})
						.then(function(userAlreadyLikedFound) {
							 done(null, productFound, userFound, userAlreadyLikedFound);
						})
						.catch(function(err) {
							return res.status(500).json({ 'error': 'unable to verify is user already liked' });
						});
					} else {
						res.status(404).json({ 'error': 'user not exist' });
					}
				},
				function(productFound, userFound, userAlreadyLikedFound, done) {
				 if(!userAlreadyLikedFound) {
					 messageFound.addUser(userFound, { isLike: DISLIKED })
					 .then(function (alreadyLikeFound) {
						 done(null, messageFound, userFound);
					 })
					 .catch(function(err) {
						 return res.status(500).json({ 'error': 'unable to set user reaction' });
					 });
				 } else {
					 if (userAlreadyLikedFound.isLike === LIKED) {
						 userAlreadyLikedFound.update({
							 isLike: DISLIKED,
						 }).then(function() {
							 done(null, productFound, userFound);
						 }).catch(function(err) {
							 res.status(500).json({ 'error': 'cannot update user reaction' });
						 });
					 } else {
						 res.status(409).json({ 'error': 'product already disliked' });
					 }
				 }
				},
				function(productFound, userFound, done) {
					productFound.update({
						likes: productFound.likes - 1,
					}).then(function() {
						done(productFound);
					}).catch(function(err) {
						res.status(500).json({ 'error': 'cannot update product like counter' });
					});
				},
			], function(messageFound) {
				if (messageFound) {
					return res.status(201).json(messageFound);
				} else {
					return res.status(500).json({ 'error': 'cannot update product' });
				}
			});
	}
}

