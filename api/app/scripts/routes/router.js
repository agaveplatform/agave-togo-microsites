
'use strict';

// Controllers
var apiResponseController = require('../controllers/apiResponseController');
var tokenController       = require('../controllers/tokenController');
var userController        = require('../controllers/userController');
var agaveIO = require('../vendor/agave/agaveIO');

module.exports = function(app) {

    app.get(
        '/',
        apiResponseController.confirmUpStatus
    );

    // Request an Agave token
    app.post(
        '/token',
        tokenController.getToken
    );

    // Refresh an Agave token
    app.put(
        '/token',
        tokenController.refreshToken
    );

    app.post(
      '/initialize',
      userController.initialize
    );


    // Errors
    app.route('*')
        .get(apiResponseController.send404)
        .post(apiResponseController.send404)
        .put(apiResponseController.send404)
        .delete(apiResponseController.send404);
};
