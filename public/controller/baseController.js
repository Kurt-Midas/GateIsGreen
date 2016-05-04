var app = angular.module('gateisgreen', 
	['ngRoute']);//, 'SdeDataService']);
	//'LandingModule', 'FleetModule', 'HandshakeCalls']);

/*app.config(['$routeProvider', function($routeProvider, SdeCaller, SdeInfo){
	$routeProvider
	.when('/',{
		templateUrl : 'landing/LandingBase.html',
		controller : 'LandingController'
	})
	.when('/fleets/:fleetKey', {
		templateUrl : 'fleet/templates/FleetBase.html',
		controller : 'FleetController',
		resolve : {
			fleetKey: function($route){
				return $route.current.params.fleetKey
			},
			isValidSession: function($route, FleetCaller, FleetInfo){
				var response FleetCaller.callFleetInfo($route.current.params.fleetKey);
				//TODO: negative scenario
				FleetInfo.setData(response.fleetinfo, response.members);
				return true;
			},
			isCalledInfo: function(SdeCalller, SdeInfo){
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
}])*/

app.controller('baseController', ['$scope', '$http', '$q', '$window',
function($scope, $http, $q, $window){
	$scope.fleetId = 1177711227919;

	$scope.doShit = function(){
		console.log("inside doShit");
		var postData = {
			method: 'POST',
			url: '/handshake/beginHandshake',
			data: {
				"fleetid": $scope.fleetId
			}
		};
		var defer = $q.defer();
		$http(postData)
		.success(function(data){
			console.log("Successfully called setup/createFleet with reply", data);
			defer.resolve(data);
		}).error(function(data,status,headers,config){
			console.error("Call to setup/create fleet failed with status" + status + "and headers" + headers)
			defer.reject();
		})
		defer.promise.then(function(successVal){
			console.log("Successful call with val:", angular.toJson(successVal))
			$window.location.href = successVal.redirect
		}, function(failReason){
			console.log("failed setup call with reason: ", failReason);
		})
	}
}])