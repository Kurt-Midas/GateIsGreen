var module = angular.module('IndividualDirectiveModule',['SdeDataModule', 'FleetDataModule'])

module.directive('individualDirective', [function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Individual.html',
        replace: true,
        scope:{},
        controllerAs: 'ind',
        controller: ['$scope', 'FleetInfo', function($scope, FleetInfo){
        	var ind = this;
        	ind.search = '';
        	ind.sortType = '';
        	ind.sortReverse = false;

        	ind.fleetmembers = FleetInfo.getMembers();

        	ind.showGlobalDisclaimer = function(){
        		alert("butts lol");
        	}

        	$scope.$on('refreshed-fleet-data', function(){
				console.log("IndividualDirective :: heard refresh event");
				ind.fleetmembers = FleetInfo.getMembers();
			})
        }]
    };
}]);

module.filter('indivSearch', [function(){ 
	return function(pilots, search){ //list of pilots, search string
		var filtered = [];
		var re = new RegExp(search, 'i'); //search string, case insensitive & global
		for(var i = 0; i < pilots.length; i++){
			var pilot = pilots[i];
			if(re.exec(pilot.chaName) 
				|| re.exec(pilot.shipName) 
				|| re.exec(pilot.shipGroup) 
				|| re.exec(pilot.system) 
				|| re.exec(pilot.constellation) 
				|| re.exec(pilot.region) 
				|| re.exec(pilot.wingName)
				|| re.exec(pilot.squadName)
				|| re.exec(pilot.boosterName)
				|| re.exec(pilot.roleName)){
				filtered.push(pilot)
			}
		} //for
		return filtered;
	}; //function
}]);//filter