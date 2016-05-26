var module = angular.module('FleetControllerModule',[
	'SdeDataModule', 'FleetDataModule', 'ui.bootstrap', 
	'WelcomeDirectiveModule', 'AggregateDirectiveModule', 'IndividualDirectiveModule', 'StructureDirectiveModule']);

module.controller('FleetController', 
			['$scope', 'fleetKey', 'loadSuccessful', 'SdeInfo', 'FleetInfo', 'FleetCaller',
			function($scope, fleetKey, loadSuccessful, SdeInfo, FleetInfo, FleetCaller){
	if(!fleetKey || !loadSuccessful){
		//redirect to error page?
		console.error("Bad resolve param:", fleetKey, loadSuccessful);
	}
	var fc = this;

	fc.debugIsConnected = "FleetController connected"; //debug
	fc.sdeInfo = SdeInfo.getData(); //{ships, locations}
	//fc.sdeInfo.ships
	//fc.sdeInfo.locations
	fc.fleetInfo = FleetInfo.getData(); //{fleetinfo, members}
	//fc.fleetInfo.fleetinfo
	//fc.fleetInfo.members
	
	fc.refreshFleetInfo = function(){
		console.log("FleetController :: refreshFleetInfo");
		FleetCaller.callFleetInfo(fleetKey).then(function(fleetData){
			console.log("FleetController :: refreshFleetInfo :: inside then");
			FleetInfo.setRichData(fleetData.fleetinfo, fleetData.members, fleetData.wings);
			$scope.$broadcast('refreshed-fleet-data');
		})
	}
}])