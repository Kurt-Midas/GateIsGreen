var module = angular.module('FleetDataModule', [])

module.service('FleetCaller', ['$http', '$q', function($http, $q, FleetInfo){
	return {
		//mock data
		callFleetInfo_mock: function(sessionId){
			var defer = $q.defer();
			var url = '/mock/getMockCerbFleet/' + sessionId;
			console.log("callFleetInfo :: using url", url);
			$http.get(url)
			.then(function successCallback(response){
				if(!response.data || !response.data.fleetinfo || !response.data.members || !response.data.wings) {
					console.error("FleetDataService :: callFleetInfo_mock :: not all required parameters");
					// console.error("FleetCaller :: callFleetInfo error, missing required data",
					// 	angular.toJson(data));
					defer.reject("FleetCaller :: callFleetInfo error, missing required response.data");
				} else {
					defer.resolve({
						"fleetinfo" : response.data.fleetinfo,
						"members" : response.data.members,
						"wings" : response.data.wings
					});
				}
			}, function errorCallback(response){
				console.error("FleetDataService :: callFleetInfo_mock :: errorCallback with response", response);
				defer.reject();
			})
			return defer.promise;
		},
		//temporary rename so I can work with mock data
		callFleetInfo : function(sessionId){
			var defer = $q.defer();
			var url = '/fleet/getFleetInfo/' + sessionId;
			console.log("callFleetInfo :: using url", url);
			$http.get(url)
			.then(function successCallback(response){
				if(!response.data || !response.data.fleetinfo || !response.data.members || !response.data.wings) { //what there is now
					console.error("FleetCaller :: callFleetInfo error, missing required data",
						angular.toJson(response.data));
					defer.reject("FleetCaller :: callFleetInfo error, missing required data");
				} else {
					//handle with $watch on sub-controllers or in the resolve callback?
					defer.resolve({
						"fleetinfo" : response.data.fleetinfo,
						"members" : response.data.members,
						"wings" : response.data.wings
					})
				}
			}, function errorCallback(response){
				console.error("FleetDataService :: callFleetInfo_real :: errorCallback with response", response);
				defer.reject();
			})
			return defer.promise;
		}
	}
}])

module.service('FleetInfo', ['SdeInfo', function(SdeInfo){
	var data = {}
	data.fleetinfo = {};
	data.members = {};
	data.wings = {};
	return {
		setFleetinfo : function(fleetinfo){
			console.log("Setting fleetinfo");
			data.fleetinfo = fleetinfo;
		},
		setMembers : function(members){
			console.log("Setting members");
			data.members = members;
		},
		setWings : function(wings){
			data.wings = wings;
		},
		setData : function(fleetinfo, members, wings){
			console.log("Setting both fleetinfo, members");
			data.fleetinfo = fleetinfo;
			data.members = members;
			data.wings = wings;
		},
		setRichData : function(fleetinfo, members, wings){
			console.log("Setting fleetinfo and rich members");
			data.fleetinfo = fleetinfo;
			if(SdeInfo.getData().ships && SdeInfo.getData().locations){
				angular.forEach(members, function(member){
					member.shipName = SdeInfo.getData().ships[member.shipId].shipName;
					member.shipGroup = SdeInfo.getData().ships[member.shipId].groupName;
					member.system = SdeInfo.getData().locations[member.systemid].s;
					member.constellation = SdeInfo.getData().locations[member.systemid].c;
					member.region = SdeInfo.getData().locations[member.systemid].r;

					if(wings[member.wingID]){
						member.wingName = wings[member.wingID].name;
						member.squadName = wings[member.wingID].squads[member.squadID];
					} else {
						member.wingName = "";
						member.squadName = "";
					}
				})
			}
			data.members = members;
			data.wings = wings;
		},
		getMembers : function(){
			return data.members;
		},
		getFleetInfo : function(){
			return data.fleetinfo;
		},
		getWings : function(){
			return data.wings;
		},
		getData : function(){
			return data;
			// return {
			// 	"fleetinfo" : data.fleetinfo,
			// 	"members" : data.members,
			// 	"wings" : data.wings
			// }
		}
	}
}])