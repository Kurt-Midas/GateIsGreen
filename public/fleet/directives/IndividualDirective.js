var app = angular.module('IndividualDirectiveModule',['SdeDataModule', 'FleetDataModule'])

app.directive('individualDirective',[function () {
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
        }]
    };
}]);

app.filter('indivSearch', function(){
	return function(pilots, search){ //list of pilots, search string
		var filtered = [];
		var re = new RegExp(search, 'i'); //search string, case insensitive & global
		for(var i = 0; i < pilots.length; i++){
			var pilot = pilots[i];
			if(re.exists(pilot.name) 
				|| re.exists(sdeData.ships[pilot.shipId].shipName)
				|| re.exists(sdeData.ships[pilot.shipId].groupName)
				|| re.exists(sdeData.ships[pilot.systemid].s)
				|| re.exists(sdeData.ships[pilot.systemid].c)
				|| re.exists(sdeData.ships[pilot.systemid].r)
				//|| re.exists(sdeData.ships[pilot.systemid].s) //wingName
				//|| re.exists(sdeData.ships[pilot.systemid].s) //squadName
				|| re.exists(sdeData.ships[pilot.systemid].boosterName)
				|| re.exists(sdeData.ships[pilot.systemid].roleName)){
				filtered.push(pilot)
			}
		} //for
		return filtered;
	}; //function
});//filter