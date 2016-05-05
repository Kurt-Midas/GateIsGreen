var module = angular.module('FleetControllerModule',[
	'SdeDataModule', 'FleetDataModule', 'ui.bootstrap']);

module.controller('FleetController', 
			['fleetKey', 'isValidSession', 'isCalledInfo', 'SdeInfo', 'FleetInfo',
			function(fleetKey, isValidSession, isCalledInfo, SdeInfo, FleetInfo){

	if(!fleetKey || !isValidSession || !isCalledInfo){
		//redirect to error page?
		console.error("Bad resolve param:", fleetKey, isValidSession, isCalledInfo);
	}

	this.debugIsConnected = "FleetController connected"; //debug
	this.sdeInfo = SdeInfo.getData(); //{ships, locations}
	//this.sdeInfo.ships
	//this.sdeInfo.locations
	this.fleetInfo = FleetInfo.getData(); //{fleetinfo, members}
	//this.fleetInfo.fleetinfo
	//this.fleetInfo.members
}])