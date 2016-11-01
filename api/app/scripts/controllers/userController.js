'use strict';

// Controllers
var apiResponseController = require('./apiResponseController');

// settings and Agave shim
var agaveIO = require('../vendor/agave/agaveIO');
var agaveSettings = require('../config/agaveSettings');

var UserController = {};
module.exports = UserController;

UserController.initialize = function(request, response) {
  var username = request.body.username;
  console.log('UserController.initialize called with request.body.access_token=', request.body.access_token);
  var p = agaveIO.getMyProfile(request.body.access_token); // first verify user request by refreshing the token
    
  p.then(function(user) {
      if (agaveSettings.authorizedUsers.length > 0 && agaveSettings.authorizedUsers.indexOf(user.username) >=0) {
          console.log('UserController.initialize:::::::::FORBIDDEN', error);
          apiResponseController.send403("You are not authorized to use this app.", response);
      } else {
        return user;
      }
    }).then(agaveIO.createHomeDirectory)
        .then( function(thing){
          return agaveIO.addUserToApp(username, agaveSettings.appId, 'EXECUTE');
        })
        .then(function(thing) {
            console.log('SUCCESS', thing);
            apiResponseController.sendSuccess(request.body.access_token, response);
            console.log('WHAT IS THIHG?', thing);
            return thing;
        })
        .fail(function(error) {
            console.log('UserController.initialize:::::::::ERROR', error);
            apiResponseController.sendError(error.message, response);
  });
};
