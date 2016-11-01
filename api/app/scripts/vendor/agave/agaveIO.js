
'use strict';

// Settings
var agaveSettings = require('../../config/agaveSettings');

// Models
var ServiceAccount = require('../../models/serviceAccount');

// Promises
var Q = require('q');

var agaveIO  = {};
module.exports = agaveIO;

var isJSON = function(input) {
   console.log("isJSON trying to parse",input);
    try {
        JSON.parse(input);
    }
    catch (error) {
        return false;
    }

    return true;
};

agaveIO.sendRequest = function(requestSettings, postData) {

    var deferred = Q.defer();

    var request = require('https').request(requestSettings, function(response) {

        var output = '';

        response.on('data', function(chunk) {
            output += chunk;
        });

        response.on('end', function() {

            var responseObject;

            if(response.statusCode === 304) {
                console.log('got 304');
                deferred.resolve({ "status" : "error", "message" : "Cannot create directory: Permisison denied"});
            }
            if (output && isJSON(output)) {
                responseObject = JSON.parse(output);
            }
            else {
                console.log('Agave response is not json.');
		console.log('response.message is ',response.message);
		console.log('response.statusCode', response.statusCode);
                deferred.reject(new Error('Agave response is not json'));
                console.log('responseObject =',responseObject);
                console.log('output =', output);
            }

            if (responseObject && responseObject.status && responseObject.status.toLowerCase() === 'success') {
		console.log("got success and this response obj",responseObject);
                deferred.resolve(responseObject);
            }
            else {
                if(responseObject === undefined) {
                    console.log('responseObject was undefined!');
                    deferred.reject(new Error('Agave response empty.'));
                } else {
                    console.log('Agave returned an error. it is: ' + JSON.stringify(responseObject));
                    deferred.reject(new Error('Agave response returned an error.' + responseObject.message));
                }
            }

        });
    });

    request.on('error', function() {
        console.log('Agave connection error.');
        deferred.reject(new Error('Agave connection error'));
    });

    if (postData) {
        // Request body parameters
        request.write(postData);
    }

    request.end();

    return deferred.promise;
};

agaveIO.sendTokenRequest = function(requestSettings, postData) {

    console.log(requestSettings);
    console.log(postData);

    var deferred = Q.defer();

    var request = require('https').request(requestSettings, function(response) {

        var output = '';

        response.on('data', function(chunk) {
            output += chunk;
        });

        response.on('end', function() {

            var responseObject;

            if (output && isJSON(output)) {
                responseObject = JSON.parse(output);
            }
            else {
                console.log('Agave token response is not json.');
                deferred.reject(new Error('Agave response is not json'));
            }

            if (responseObject && responseObject.access_token && responseObject.refresh_token && responseObject.token_type && responseObject.expires_in) {
                deferred.resolve(responseObject);
            }
            else {
                console.log('Agave returned a token error. it is: ' + JSON.stringify(responseObject));
                console.log('Agave returned a token error. it is: ' , responseObject);
                deferred.reject(new Error('Agave response returned an error'));
            }

        });
    });

    request.on('error', function() {
        console.log('Agave token connection error.');
        deferred.reject(new Error('Agave connection error'));
    });

    if (postData) {
        // Request body parameters
        request.write(postData);
    }

    request.end();

    return deferred.promise;
};

// Fetches an internal user token based on the supplied auth object and returns the auth object with token data on success
agaveIO.getToken = function(auth) {

    console.log('auth: ', auth);
    var deferred = Q.defer();

    var postData = 'grant_type=password&scope=PRODUCTION&username=' + auth.username + '&password=' + auth.password;

    console.log('postData:', postData);

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        auth:     agaveSettings.clientKey + ':' + agaveSettings.clientSecret,
        path:     '/token',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    agaveIO.sendTokenRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};


// Refreshes a token and returns it on success
agaveIO.refreshToken = function(auth) {

    var deferred = Q.defer();

    console.log('agaveIO.refreshToken with auth ='+ auth);

    var postData = 'grant_type=refresh_token&scope=PRODUCTION&refresh_token=' + auth;

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        auth:     agaveSettings.clientKey + ':' + agaveSettings.clientSecret,
        path:     '/token',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    agaveIO.sendTokenRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

/*
// Deletes a token
agaveIO.deleteToken = function(auth) {

    var deferred = Q.defer();

    var postData = 'token=' + auth.password;

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        auth:     agaveSettings.clientKey + ':' + agaveSettings.clientSecret,
        path:     '/revoke',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    agaveIO.sendTokenRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};
*/

// Fetches an internal user token based on the supplied auth object and returns the auth object with token data on success
agaveIO.createUser = function(user) {

    var deferred = Q.defer();

    var postData = 'username='  + user.username
                 + '&password=' + user.password
                 + '&email='    + user.email;

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/profiles/v2/',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.createUserProfile = function(user, userAccessToken) {

    var deferred = Q.defer();

    var postData = {
        name: 'profile',
        value: user
    };

    postData = JSON.stringify(postData);

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/meta/v2/data',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/json',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + userAccessToken
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getMyProfile = function(accessToken) {
  var deferred = Q.defer();

  var requestSettings = {
    host:     agaveSettings.hostname,
    method:   'GET',
    path:     '/profiles/v2/me',
    rejectUnauthorized: false,
    headers: {
        'Authorization': 'Bearer ' + accessToken
    }
  };

  agaveIO.sendRequest(requestSettings, null)
      .then(function(responseObject) {
          console.log('agaveIO.getMyProfile agaveIO.sendRequest ',responseObject);
          deferred.resolve(responseObject.result);
      })
      .fail(function(errorObject) {
          console.log('agaveIO.getMyProfile agaveIO.sendRequest error',errorObject);
          deferred.reject(errorObject);
      });

  return deferred.promise;
};

agaveIO.createProjectMetadata = function(projectName) {

    var deferred = Q.defer();

    var postData = {
        name: 'project',
        value: {
            'name': projectName
        }
    };

    postData = JSON.stringify(postData);

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/meta/v2/data',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/json',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.addUserToApp = function(user, app, pems) {
  var deferred = Q.defer();

  console.log('#############agaveIO.addUserToApp with user=', user);
  console.log('...app = ' + app + ' ...and pems=' + pems);

  if(user === agaveSettings.serviceAccountUsername) {
    deferred.resolve('success');
  }

  var postData = 'permission=EXECUTE';

  var serviceAccount = new ServiceAccount();

  var requestSettings = {
    host:     agaveSettings.hostname,
    method:   'POST',
    path:     '/apps/v2/' + app + '/pems/'+user,
    rejectUnauthorized: false,
    headers: {
        'Content-Length': postData.length,
        'Authorization': 'Bearer ' + serviceAccount.accessToken,
    }
  };
  console.log('requestSettings:',requestSettings);
  console.log('postData:', postData);

  agaveIO.sendRequest(requestSettings, postData)
      .then(function(responseObject) {
          console.log('&&&&&&&&&&&&&agaveIO.addUserToApp reponse is');
          console.log(responseObject.result);
          deferred.resolve(responseObject.result);
      })
      .fail(function(errorObject) {
        console.log('PEMS request failed with errorObject=',errorObject);
        console.log(errorObject);
          deferred.reject(errorObject);
      });

  return deferred.promise;
};

agaveIO.createHomeDirectory = function(user) {
  var deferred = Q.defer();

  console.log('agaveIO.createHomeDirectory with user=', user);

  var postData = 'action=mkdir&path=' + user.username;

  var serviceAccount = new ServiceAccount();

  var requestSettings = {
      host:     agaveSettings.hostname,
      method:   'PUT',
      path:     '/files/v2/media/system/' + agaveSettings.storageSystem + '/',
      rejectUnauthorized: false,
      headers: {
          'Content-Length': postData.length,
          'Authorization': 'Bearer ' + serviceAccount.accessToken,
      }
  };
  console.log('requestSettings:',requestSettings);
  console.log('postData:', postData);

  agaveIO.sendRequest(requestSettings, postData)
      .then(function(responseObject) {
          console.log('in then to resolve the responseObject, which is', responseObject);
          console.log(responseObject.result);
          deferred.resolve(responseObject.result);
      })
      .fail(function(errorObject) {
          console.log('!!!!!!!!!!!!createHomeDirectory errorObject.message is -->' + errorObject.message);
          if(errorObject.message === 'Agave response returned an error.Directory ' + user.username +' already exists'){
            console.log('Directory ALREADY EXISTS!!');
            deferred.resolve('hi');
          } else {
            console.log('SOMETHING ELSE WENT WRONG');
            console.log(errorObject);
            console.log('errorObject ',  errorObject);
            deferred.reject(errorObject);
          }
      });

  return deferred.promise;
};

agaveIO.createProjectDirectory = function(directory) {

    var deferred = Q.defer();

    var postData = 'action=mkdir&path=' + directory;

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'PUT',
        path:     '/files/v2/media/system/' + agaveSettings.storageSystem + '//projects/',
        rejectUnauthorized: false,
        headers: {
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + serviceAccount.accessToken,
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.addUsernameToMetadataPermissions = function(username, accessToken, uuid) {

    var deferred = Q.defer();

    var postData = 'username=' + username + '&permission=READ_WRITE';

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/meta/v2/data/' + uuid + '/pems',
        rejectUnauthorized: false,
        headers: {
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + accessToken,
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.removeUsernameFromMetadataPermissions = function(username, accessToken, uuid) {

    var deferred = Q.defer();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'DELETE',
        path:     '/meta/v2/data/' + uuid + '/pems/' + username,
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getMetadataPermissions = function(accessToken, uuid) {

    var deferred = Q.defer();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'GET',
        path:     '/meta/v2/data/' + uuid + '/pems',
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getProjectFileMetadataPermissions = function(accessToken, projectUuid) {

    var deferred = Q.defer();

    var requestSettings = {
        host:   agaveSettings.hostname,
        method: 'GET',
        path:   '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"projectFile",'
                    + '"value.projectUuid":"' + projectUuid + '"'
                + '}'),
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getFilePermissions = function(accessToken, filePath) {

    var deferred = Q.defer();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'GET',
        path:     '/files/v2/pems/system/' + agaveSettings.storageSystem + '//projects/' + filePath,
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getFileListings = function(accessToken, projectUuid) {

    var deferred = Q.defer();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'GET',
        path:     '/files/v2/listings/system/' + agaveSettings.storageSystem + '//projects/' + projectUuid + '/files',
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.addUsernameToJobPermissions = function(username, accessToken, jobId) {

    var deferred = Q.defer();

    var postData = {
        'username': username,
        'permission': 'ALL',
    };

    postData = JSON.stringify(postData);

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/jobs/v2/' + jobId + '/pems',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + accessToken,
        },
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.addUsernameToFullFilePermissions = function(username, accessToken, filePath) {

    var deferred = Q.defer();

    var postData = {
        'username': username,
        'permission': 'ALL',
        'recursive': true,
    };

    postData = JSON.stringify(postData);

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/files/v2/pems/system/' + agaveSettings.storageSystem + '//projects/' + filePath,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + accessToken,
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.removeUsernameFromFilePermissions = function(username, accessToken, filePath) {

    var deferred = Q.defer();

    //var postData = 'username=' + username + '&read=false&write=false&execute=false';
    var postData = {
        'username': username,
        'permission': 'NONE',
        'recursive': true,
    };

    postData = JSON.stringify(postData);

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/files/v2/pems/system/' + agaveSettings.storageSytem + '//projects/' + filePath,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + accessToken,
        },
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.createPasswordResetMetadata = function(username) {

    var deferred = Q.defer();

    var postData = {
        name: 'passwordReset',
        value: {
            'username': username
        }
    };

    postData = JSON.stringify(postData);

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/meta/v2/data',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/json',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getJobMetadata = function(projectUuid, jobUuid) {

    var deferred = Q.defer();

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:   agaveSettings.hostname,
        method: 'GET',
        path:   '/meta/v2/data?q='
                    + encodeURIComponent(
                        '{'
                            + '"name":"projectJob",'
                            + '"value.projectUuid":"' + projectUuid + '",'
                            + '"value.jobUuid":"' + jobUuid + '",'
                        + '}'
                    ),
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getJobMetadataForProject = function(projectUuid) {

    var deferred = Q.defer();

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:   agaveSettings.hostname,
        method: 'GET',
        path:   '/meta/v2/data?q='
                    + encodeURIComponent(
                        '{'
                            + '"name":"projectJob",'
                            + '"value.projectUuid":"' + projectUuid + '"'
                        + '}'
                    ),
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.getPasswordResetMetadata = function(uuid) {

    var deferred = Q.defer();

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'GET',
        path:     '/meta/v2/data?q=' + encodeURIComponent('{"name":"passwordReset", "uuid":"' + uuid + '", "owner":"' + serviceAccount.username + '"}'),
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.deleteMetadata = function(uuid) {

    var deferred = Q.defer();

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'DELETE',
        path:     '/meta/v2/data/' + uuid,
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.updateUserPassword = function(user) {

    var deferred = Q.defer();

    var postData = 'username='  + user.username
                 + '&password=' + user.password
                 + '&email='    + user.email;

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'PUT',
        path:     '/profiles/v2/' + user.username + '/',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': 'Bearer ' + serviceAccount.accessToken
        }
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

agaveIO.createJobMetadata = function(projectUuid, jobUuid) {

    var deferred = Q.defer();

    var postData = {
        name: 'projectJob',
        value: {
            projectUuid: projectUuid,
            jobUuid: jobUuid,
        },
    };

    postData = JSON.stringify(postData);

    var serviceAccount = new ServiceAccount();

    var requestSettings = {
        host:     agaveSettings.hostname,
        method:   'POST',
        path:     '/meta/v2/data',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/json',
            'Content-Length': postData.length,
            'Authorization':  'Bearer ' + serviceAccount.accessToken
        },
    };

    agaveIO.sendRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};
