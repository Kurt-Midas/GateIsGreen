var app = angular.module('gateisgreen', 
	['ngRoute', 'FleetControllerModule', 'SdeDataModule', 'FleetDataModule', 'LandingControllerModule']);
	//'LandingModule', 'FleetModule', 'HandshakeCalls']);

app.config(['$routeProvider', function($routeProvider, SdeCaller, SdeInfo){
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
				console.log("Resolving fleetKey");
				return $route.current.params.fleetKey
			},
			isValidSession: function($route, FleetCaller, FleetInfo){
				console.log("Resolving isValidSession");
				return FleetCaller.callFleetInfo($route.current.params.fleetKey).then(function(data){
					console.log("got data from fleetCaller.callFleetInfo");
					FleetInfo.setData(data.fleetinfo, data.members);
					return true;
					//TODO: return fail case
				});
			},
			isCalledInfo: function(SdeCaller, SdeInfo){
				console.log("Resolving isCalledInfo");
				return SdeCaller.callSdeData().then(function(data){
					if(!data || !data.shipInfo || !data.locations){
						//failed, console or something
						return false;
					}
					SdeInfo.setData(data.shipInfo, data.locations);
					return true;
				})
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