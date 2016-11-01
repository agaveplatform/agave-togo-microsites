
'use strict';

// Controllers
var apiResponseController = require('./apiResponseController');

// Processing
var agaveIO = require('../vendor/agave/agaveIO');

var TokenController = {};
module.exports = TokenController;

// Retrieves a new user token from Agave and returns it to the client
TokenController.getToken = function(request, response) {

    console.log('TokenController.getToken with request.body', request.body);
    
    if(request.body.grant_type == 'refresh_token') {
        agaveIO.refreshToken(request.body.refresh_token)
            .then(function(agaveToken) {
                apiResponseController.sendSuccess(agaveToken, response);
            }, function(error) {
                apiResponseController.sendError(error.message, response);
            });
    } else {
        if (request.body.username && agaveSettings.authorizedUsers.indexOf(request.body.username) < 0) {
            apiResponseController.send403("You do not have access to use this site.", response);
        }
        else {
            agaveIO.getToken(request.body)
                .then(function (agaveToken) {
                    apiResponseController.sendSuccess(agaveToken, response);
                }, function (error) {
                    apiResponseController.sendError(error.message, response);
                });
        }
    }
};

// Refreshes a user token from Agave and returns it to the client
TokenController.refreshToken = function(request, response) {

    console.log('TokenController.refreshToken: request is ', request)
    agaveIO.refreshToken(request.user)
        .then(function(agaveToken) {
            apiResponseController.sendSuccess(agaveToken, response);
        }, function(error) {
            apiResponseController.sendError(error.message, response);
        });

};

/*
// Deletes a user token from Agave and returns it to the client
TokenController.deleteToken = function(request, response) {

    agaveIO.deleteToken(request.user)
        .then(function(agaveToken) {
            apiResponseController.sendSuccess(agaveToken, response);
        }, function(error) {
            apiResponseController.sendError(error.message, response);
        });

};
*/
