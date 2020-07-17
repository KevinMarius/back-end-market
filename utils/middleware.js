var jwtUtils = require('../utils/jwt.utils');

module.exports = {
  middleware: function(req, res) {
    var headerAuth  = req.headers['authorization'];
    if (headerAuth) {
      var userId      = jwtUtils.getUserId(headerAuth);
    }else {
      return res.status(401).json({'error': 'access denied'});
    }
    return userId;
  }
}