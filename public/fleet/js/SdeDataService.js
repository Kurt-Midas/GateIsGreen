var module = angular.module('SdeDataModule', [])

module.service('SdeCaller', ['$http', '$q', function($http, $q){
	return {
		callSdeData: function() {
			var defer = $q.defer();
			$http.get('/info')
			.success(function(data) {
				if(!data.shipInfo || !data.locationInfo){
					defer.reject("Data Failure");
				}
				defer.resolve({
					"shipInfo": 	data.shipInfo,
					"locations":	data.locationInfo
				});
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