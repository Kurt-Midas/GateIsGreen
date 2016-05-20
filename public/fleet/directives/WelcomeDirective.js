var module = angular.module('WelcomeDirectiveModule',[])

module.directive('welcomeDirective',[function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Welcome.html',
        replace: true
    };
}]);