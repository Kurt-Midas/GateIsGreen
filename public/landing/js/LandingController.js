var module = angular.module('LandingControllerModule',[
	'SdeDataModule', 'FleetDataModule']);

module.controller('LandingController', 
			['$scope', '$http', '$q', '$window',
			function($scope, $http, $q, $window){
	 this.fleetId = 1177611234687;

	this.beginHandshake = function(){
		console.log("inside beginHandshake");
		var postData = {
			method: 'POST',
			url: '/handshake/beginHandshake',
			data: {
				"fleetid": this.fleetId
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