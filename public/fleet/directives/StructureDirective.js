var module = angular.module('StructureDirectiveModule',[])

module.directive('structureDirective',[function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Structure.html',
        replace: true
    };
}]);