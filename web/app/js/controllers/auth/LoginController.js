angular.module('AgaveToGo').controller('LoginController',
    function ($injector, $timeout, $rootScope, $scope, $state, $stateParams, $localStorage, TenantsController, $translate) {

        $rootScope.settings.layout.tenantPage = true;
        $rootScope.settings.layout.loginPage = false;
        $scope.client = $rootScope.settings.oauth.clients[$rootScope.settings.tenantId];
        console.log($scope.client);
        $scope.useImplicit = true;

        $scope.tenant = $localStorage.tenant;

        console.log($scope.tenant);

        $scope.randomState = Math.ceil(Math.random() * 9);

        $scope.user = ($localStorage.client && angular.copy($localStorage.client)) || {
            username: '',
            password: '',
            client_key: '',
            client_secret: '',
            remember: 0
        };

        /**
         * Looks up tenant by the code/id
         * @param tenantId
         * @returns {*}
         */
        $scope.getTenantByCode = function (tenantId) {
            if ($rootScope.settings.tenants[tenantId]) {
                return $rootScope.settings.tenants[tenantId];
            } else {
                App.alert(
                    {
                        type: 'danger',
                        message: $translate.instant('error_tenant_list')
                    }
                );
            }
        };


        /**
         * Fetches access token by walking a Password Flow when the user has provided a client key and secret
         *
         * @param user
         * @param options
         * @returns {PromiseLike<T> | Promise<T>}
         */
        var getAccessToken = function (user, options) {
            // Check if `user` has required properties.
            if (!user || !user.username || !user.password) {
                Alerts.danger({message: 'Please supply a valid username and password'});
            }

            var data = {
                grant_type: 'password',
                username: $scope.user.username,
                password: $scope.user.password
            };

            data = queryString.stringify(data);

            options = angular.extend({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
                }
            }, options);

            return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
                function (response) {
                    $localStorage.token = response;
                    $localStorage.client = $scope.user;
                    $localStorage.tenant = $scope.tenant;
                    $rootScope.broadcast('oauth:login', token);
                    return response;
                },
                function (response) {
                    $rootScope.broadcast('oauth:denied');
                });
        };

        /**
         * Retrieves the `refresh_token` and stores the `response.data` on cookies
         * using the `OAuthToken`.
         *
         * @return {promise} A response promise.
         */
        var getRefreshToken = function () {
            var data = {
                grant_type: 'refresh_token',
                refresh_token: $localStorage.token.refresh_token,
                scope: 'PRODUCTION'
            };

            if (null !== config.clientSecret) {
                data.client_secret = config.clientSecret;
            }

            data = queryString.stringify(data);

            var options = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': btoa($scope.user.client_key + ':' + $scope.user.client_secret)
                }
            };

            return $http.post($scope.tenant.baseUrl + '/token', data, options).then(
                function (response) {
                    $localStorage.token = response;
                    $rootScope.broadcast('oauth:refresh', token);
                    $localStorage.tenant = $scope.tenant;
                    return response;
                },
                function (response) {
                    $rootScope.broadcast('oauth:denied');
                });
        };

    });
