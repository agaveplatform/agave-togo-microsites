/* Setup blank page controller */
angular.module('AgaveToGo').controller('RemoteInterativeSessionController', ['$rootScope', '$scope', '$state', 'settings', 'Commons', function($rootScope, $scope, $state, settings, Commons) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();

        // set default layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    $scope._COLLECTION_NAME = 'jobs';
    $scope._RESOURCE_NAME = 'job';
    $scope[$scope._COLLECTION_NAME] = [];
    $scope.sortType = 'startTime';
    $scope.sortReverse = true;
    $scope.query = '';

    var remoteApps = $filter('filter')($rootScope.settings.remote, function(val, i) {
        if (val.appId) {
            return val.appId;
        }
    });


    if ($state.type) {
        if ($rootScope.settings.remote[$state.type] && $rootScope.settings.remote[$state.type].appId) {
            $scope.query = 'appId.eq=' + $rootScope.settings.remote[$state.type].appId;
        }
        else {
            MessageService.handle(response, $translate.instant('error_remote_app'));
            $scope.requesting = false;
        }
    }

    $scope.refresh = function () {
        $scope.requesting = true;

        JobsController.searchJobs(
            $scope.query
        )
            .then(
                function (response) {

                    $scope.totalItems = response.result.length;
                    $scope.pagesTotal = Math.ceil(response.result.length / $scope.limit);
                    $scope[$scope._COLLECTION_NAME] = response.result;

                    $scope.requesting = false;
                },
                function (response) {
                    MessageService.handle(response, $translate.instant('error_jobs_list'));
                    $scope.requesting = false;
                }
            );

    };

    if ($state.current.vnc) {
        $timeout(function() {
            $scope.sessionName = $rootScope.remote.vnc.jobId;
            $scope.sessionUrl = $rootScope.remote.vnc.url;
        }, 50);
    }
}]);
