var module = angular.module('SdeDataModule', [])

module.service('SdeCaller', ['$http', '$q', function($http, $q){
	return {
		callSdeData: function() {
			var defer = $q.defer();
			$http.get('/info').then(function successCallback(response) {
				if(!response.data.shipInfo || !response.data.locationInfo){
					defer.reject("response.data Failure");
				}
				defer.resolve({
					"shipInfo": 	response.data.shipInfo,
					"locations":	response.data.locationInfo
				});
			}, function errorCallback(response){
				console.error("SdeDataService :: callSdeData :: ErrorCallback with response", response);
				defer.reject();
			});
			return defer.promise;
		}
	}
}])

module.service('SdeInfo', [function(){
	var sdeData = {};
	return{
		setShipsData: function(ships){
			this.sdeData.ships = ships;
		},
		setLocationsData: function(locations){
			this.sdeData.locations = locations;
		},
		setData: function(sh, loc){
			this.sdeData = {
				"ships":sh,
				"locations": loc
			}
		},
		getData: function(){
			return {
				"ships": this.sdeData.ships,
				"locations": this.sdeData.locations
			}
		}
	}
}])