var app = angular.module('gateisgreen', 
	['ngRoute', 'FleetControllerModule', 'SdeDataModule', 'FleetDataModule', 'LandingControllerModule']);

app.config(['$routeProvider', function($routeProvider){
	$routeProvider
	.when('/',{
		templateUrl : 'landing/LandingBase.html',
		controller : 'LandingController',
		controllerAs : 'lc'
	})
	.when('/fleets/:fleetKey', {
		templateUrl : 'fleet/FleetBase.html',
		controller : 'FleetController',
		controllerAs: 'fc',
		resolve : {
			fleetKey: function($route){
				console.log("Resolving fleetKey", $route.current.params.fleetKey);
				return $route.current.params.fleetKey
			},
			loadSuccessful: function($route, $q, FleetCaller, SdeCaller, FleetInfo, SdeInfo){
				console.log("resolving isCalledInfo");
				let promises = {
					sdeData: SdeCaller.callSdeData(),
					fleetData: FleetCaller.callFleetInfo($route.current.params.fleetKey)};
				return $q.all(promises).then(function(values){
					if(!values.sdeData || !values.sdeData.shipInfo || !values.sdeData.locations){
						console.error("Failed to resolve promise on sdeData");
						return false;
					}
					if(!values.fleetData){
						console.error("Failed to resolve promise on fleetData");
						return false;
					}
					SdeInfo.setData(values.sdeData.shipInfo, values.sdeData.locations);
					FleetInfo.setRichData(values.fleetData.fleetinfo, values.fleetData.members);
					return true;
				});
			}
		}
	})
	.otherwise({
		//Error page?
		redirectTo : '/'
	})
}])

app.controller('BaseController', [function(){
	this.hello = "Hello from BaseController";
}])