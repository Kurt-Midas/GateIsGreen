var module = angular.module('IndividualDirectiveModule',['SdeDataModule', 'FleetDataModule'])

module.directive('individualDirective',[function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Individual.html',
        replace: true,
        scope:{},
        controllerAs: 'ind',
        controller: ['FleetInfo', 'SdeInfo', function(FleetInfo, SdeInfo){
        	var ind = this;
        	ind.search = '';
        	ind.sortType = '';
        	ind.sortReverse = false;

        	ind.fleetmembers = FleetInfo.getMembers();
        	ind.sdeData = SdeInfo.getData();

        	ind.showGlobalDisclaimer = function(){
        		alert("butts lol");
        	}
        }]
    };
}]);

module.filter('indivSearch', ['SdeInfo', function(SdeInfo){
	var sdeData = SdeInfo.getData();
	return function(pilots, search){ //list of pilots, search string
		var filtered = [];
		var re = new RegExp(search, 'i'); //search string, case insensitive & global
		for(var i = 0; i < pilots.length; i++){
			var pilot = pilots[i];
			if(re.exec(pilot.chaName) 
				|| re.exec(sdeData.ships[pilot.shipId].shipName)
				|| re.exec(sdeData.ships[pilot.shipId].groupName)
				|| re.exec(sdeData.locations[pilot.systemid].s)
				|| re.exec(sdeData.locations[pilot.systemid].c)
				|| re.exec(sdeData.locations[pilot.systemid].r)
				//|| re.exec(sdeData.ships[pilot.systemid].s) //wingName
				//|| re.exec(sdeData.ships[pilot.systemid].s) //squadName
				|| re.exec(pilot.boosterName)
				|| re.exec(pilot.roleName)){
				filtered.push(pilot)
			}
		} //for
		return filtered;
	}; //function
}]);//filter