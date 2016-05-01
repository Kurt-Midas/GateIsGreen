var app = angular.module('gateisgreen', []);
//['ngRoute','PlanetaryGadget','ScrapGadget','PlanetData']);

app.controller('baseController', ['$scope', '$http', '$q', '$window',
function($scope, $http, $q, $window){
	$scope.fleetId = 1130011227919;

	$scope.doShit = function(){
		console.log("inside doShit");
		var postData = {
			method: 'POST',
			url: '/setup/createFleet',
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
			console.error("MarketService.getMarketInfo failed with status" + status + "and headers" + headers)
			defer.reject();
		})
		defer.promise.then(function(successVal){
			console.log("Successful call with val:", angular.toJson(successVal))
			$window.location.href = successVal.redirect
		}, function(failReason){
			console.log("failed market call with reason: ", failReason);
		})
	}
}])