var express = require('express');
var userCtrl = require('./Routes/userCtrl');
var productCtrl = require('./Routes/productCtrl');
var categorieCtrl = require('./Routes/categorieCtrl');
var likeCtrl = require('./Routes/likeCtrl')

exports.Router = (function () {
  var apiRouter = express.Router();
  
  //users route
  apiRouter.route('/users/register/').post(userCtrl.register);
  apiRouter.route('/users/login/').post(userCtrl.login);
  apiRouter.route('/users/').get(userCtrl.getUser);
  apiRouter.route('/users/me/').get(userCtrl.getUserProfile);
  apiRouter.route('/users/me/').put(userCtrl.updateUserProfile);
  apiRouter.route('/users/password/reset/:token').post(userCtrl.resetPassword);
  apiRouter.route('/users/password/forgot').post(userCtrl.forgotPassword);
  apiRouter.route('/users/isAdmin/:user/').put(userCtrl.putAdmin);

  // products route
  apiRouter.route('/product/').get(productCtrl.getProduct);
  apiRouter.route('/product/:productId/').get(productCtrl.showProduct);
  apiRouter.route('/product/').post(productCtrl.createProduct);
  apiRouter.route('/product/:productId/').put(productCtrl.updateProduct);
  apiRouter.route('/product/:productId/').delete(productCtrl.deleteProduct);

  // messages route


  // likes route
  apiRouter.route('/product/:productId/vote/like').post(likeCtrl.likePost);
  apiRouter.route('/product/:productId/vote/dislike').post(likeCtrl.dislikePost);

  // categories route
  apiRouter.route('/categorie/').post(categorieCtrl.createCategorie);
  apiRouter.route('/categorie/').get(categorieCtrl.listCategorie);
  apiRouter.route('/categorie/:categorieId/').put(categorieCtrl.updateCategorie);
  apiRouter.route('/categorie/:categorieId/').delete(categorieCtrl.deleteCategorie);

  return apiRouter;
})();