/* Setup blank page controller */
angular.module('AgaveToGo').controller('VNCController', ['$rootScope', '$scope', '$state', 'settings', function($rootScope, $scope, $state, settings) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();

        // set default layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    });

    if ($state.current.vnc) {
        $timeout(function() {
            $scope.sessionName = $rootScope.remote.vnc.jobId;
            $scope.sessionName = $rootScope.remote.vnc.url;
        }, 50);
    }
}]);
