var module = angular.module('StructureDirectiveModule',['FleetDataModule'])

module.directive('structureDirective',[function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Structure.html',
        replace: true,
        scope: {},
        controllerAs: 'str',
        controller: ['FleetInfo', function(FleetInfo){
        	var str = this;
        	str.fleetmembers = FleetInfo.getMembers();
        }]
    };
}]);