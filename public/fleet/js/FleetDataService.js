var module = angular.module('FleetDataModule', [])

module.service('FleetCaller', ['$http', '$q', function($http, $q, FleetInfo){
	return {
		//mock data
		callFleetInfo_mock: function(sessionId){
			var defer = $q.defer();
			var url = '/mock/getMockCerbFleet/' + sessionId;
			console.log("callFleetInfo :: using url", url);
			$http.get(url)
			.success(function(data){
				if(!data || !data.fleetinfo || !data.members) { //what there is now
					// console.error("FleetCaller :: callFleetInfo error, missing required data",
					// 	angular.toJson(data));
					defer.reject("FleetCaller :: callFleetInfo error, missing required data");
				} else {
					defer.resolve({
						"fleetinfo" : data.fleetinfo,
						"members" : data.members
					});
				}
			})
			return defer.promise;
		},
		//temporary rename so I can work with mock data
		callFleetInfo : function(sessionId){
			var defer = $q.defer();
			var url = '/fleet/getFleetInfo/' + sessionId;
			console.log("callFleetInfo :: using url", url);
			$http.get(url)
			.success(function(data){
				if(!data || !data.fleetinfo || !data.members) { //what there is now
					console.error("FleetCaller :: callFleetInfo error, missing required data",
						angular.toJson(data));
					defer.reject("FleetCaller :: callFleetInfo error, missing required data");
				} else {
					//handle with $watch on sub-controllers or in the resolve callback?
					defer.resolve({
						"fleetinfo" : data.fleetinfo,
						"members" : data.members
					})
				}
			})
			return defer.promise;
		}
	}
}])

module.service('FleetInfo', ['SdeInfo', function(SdeInfo){
	var fleetinfo = {};
	var members = {};
	return {
		setFleetinfo : function(fleetinfo){
			console.log("Setting fleetinfo");
			this.fleetinfo = fleetinfo;
		},
		setMembers : function(members){
			console.log("Setting members");
			this.members = members;
		},
		setData : function(fleetinfo, members){
			console.log("Setting both fleetinfo, members");
			this.fleetinfo = fleetinfo;
			this.members = members;
		},
		setRichData : function(fleetinfo, members){
			console.log("Setting fleetinfo and rich members");
			this.fleetinfo = fleetinfo;
			if(SdeInfo.getData().ships && SdeInfo.getData().locations){
				angular.forEach(members, function(member){
					member.shipName = SdeInfo.getData().ships[member.shipId].shipName;
					member.shipGroup = SdeInfo.getData().ships[member.shipId].groupName;
					member.system = SdeInfo.getData().locations[member.systemid].s;
					member.constellation = SdeInfo.getData().locations[member.systemid].c;
					member.region = SdeInfo.getData().locations[member.systemid].r;
				})
			}
			this.members = members;
		},
		getMembers : function(){
			return this.members;
		},
		getFleetInfo : function(){
			return this.fleetinfo;
		},
		getData : function(){
			return {
				"fleetinfo" : this.fleetinfo,
				"members" : this.members
			}
		}
	}
}])