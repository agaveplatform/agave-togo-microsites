/* Setup blank page controller */
angular.module('AgaveToGo').controller('ChangelogController', function($rootScope, $scope, $filter, resolvedChangelog) {

    $scope.changelog = resolvedChangelog;

});
