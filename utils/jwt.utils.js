// imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = 'kcdyw73r29uf92xjh7q38m9ix8n62t3r72xm9i9ry372tcn7ym3rc28xdnvc7c838ur9n283h98f7429fmc2973cn293928';

//exports functions
module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
            userId: userData.id,
            isAdmin: userData.isAdmin,
            username: userData.username
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    },
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', ''): null;
    },
    getUserId: function(authorization) {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);

        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if(jwtToken != null) {
                    userId = jwtToken.userId;
                }
            } catch (err) {}
        }
        return userId;
    }
}