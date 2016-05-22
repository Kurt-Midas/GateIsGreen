var module = angular.module('FleetControllerModule',[
	'SdeDataModule', 'FleetDataModule', 'ui.bootstrap', 
	'WelcomeDirectiveModule', 'AggregateDirectiveModule', 'IndividualDirectiveModule', 'StructureDirectiveModule']);

module.controller('FleetController', 
			['fleetKey', 'loadSuccessful', 'SdeInfo', 'FleetInfo',
			function(fleetKey, loadSuccessful, SdeInfo, FleetInfo){

	if(!fleetKey || !loadSuccessful){
		//redirect to error page?
		console.error("Bad resolve param:", fleetKey, loadSuccessful);
	}

	this.debugIsConnected = "FleetController connected"; //debug
	this.sdeInfo = SdeInfo.getData(); //{ships, locations}
	//this.sdeInfo.ships
	//this.sdeInfo.locations
	this.fleetInfo = FleetInfo.getData(); //{fleetinfo, members}
	//this.fleetInfo.fleetinfo
	//this.fleetInfo.members
}])