app.directive('welcomeDirective',[function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Welcome.html',
        replace: true
    };
}]);