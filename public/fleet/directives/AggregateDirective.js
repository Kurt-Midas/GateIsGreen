angular.module('AggregateDirectiveModule',['SdeDataModule', 'FleetDataModule'])
.directive('aggregateDirective',
['FleetInfo', 'SdeInfo', function (FleetInfo, SdeInfo) {
	return {
		restrict: 'E',
		templateUrl: '/fleet/partials/Aggregate.html',
		replace: true,
		scope:{},
		controllerAs: 'agg',
		controller: ['$scope', 'FleetInfo', 'SdeInfo', function($scope, FleetInfo, SdeInfo){
			var agg = this;
			agg.boxes = {};
			agg.boxes.shipBox 			= true;
			agg.boxes.shipgroupBox 		= false;
			agg.boxes.systemBox 		= false;
			agg.boxes.constelBox		= false;
			agg.boxes.regionBox 		= false;
			agg.boxes.fleetwarpBox		= false;
			agg.boxes.boosterBox		= false;
			agg.boxes.roleBox 			= false;

			agg.boxes.chanameBox = false;
			// agg.boxes.wingBox = false; 	//TODO:	implement wing endpoints
			// agg.boxes.squadBox = false;	//TODO: implement squad endpoints

			agg.aggregates = {};
			agg.aggregates.groups = [];
			function getGroupings(){
				var fleetmembers = FleetInfo.getMembers();
				var sdeData = SdeInfo.getData();
				var groupings = [];
				for(var i = 0; i < fleetmembers.length; i++){
					console.log("Iterating over member", i, "of", fleetmembers.length, angular.toJson(fleetmembers[i]));
					var member = {};
					if(agg.boxes.shipBox){member.shipType = sdeData.ships[fleetmembers[i].shipId].shipName;} //do the translation now?
					if(agg.boxes.shipgroupBox){member.shipGroup = sdeData.ships[fleetmembers[i].shipId].groupName;} //yep, definitely do the translation
					if(agg.boxes.systemBox){member.system = sdeData.locations[fleetmembers[i].systemid].s;}
					if(agg.boxes.constelBox){member.constellation = sdeData.locations[fleetmembers[i].systemid].c;}
					if(agg.boxes.regionBox){member.region = sdeData.locations[fleetmembers[i].systemid].r;}
					if(agg.boxes.fleetwarpBox){member.fleetwarp = fleetmembers[i].takesFleetWarp;}
					if(agg.boxes.boosterBox){member.boosterName = fleetmembers[i].boosterName;}
					if(agg.boxes.roleBox){member.roleName = fleetmembers[i].roleName;}
					var index = objectArrayIndexOfEquivalent(groupings, member, "chars");
					if(index == -1){
						member.chars = [];
						member.chars.push(fleetmembers[i].chaName);
						groupings.push(member);
					} else {
						groupings[index].chars.push(fleetmembers[i].chaName);
					}
				}//for
				agg.aggregates.groups = groupings;
			}
			$scope.$watch(
				"agg.boxes", 
				function(newValue, oldValue){
					console.log("Saw change in agg.boxes");
					getGroupings();
				},//function
				true //object refEq on $watch
			)
		}]
	};
}]);

function objectArrayIndexOfEquivalent(arr, obj, ignore){
	for(var i = 0; i < arr.length; i++){
		if(objectEquivalence(arr[i], obj, ignore)){
			return i;
		}
	}
	return -1;
}

function objectEquivalence(first, second, ignore){
	var firstProps = Object.getOwnPropertyNames(first);
	let firstIndex = firstProps.indexOf(ignore);
	if(firstIndex != -1){
		firstProps.splice(firstIndex, 1);
	}
	var secondProps = Object.getOwnPropertyNames(second);
	let secondIndex = secondProps.indexOf(ignore);
	if(secondIndex != -1){
		secondProps.splice(firstIndex, 1);
	}
	if(firstProps.length != secondProps.length){
		return false;
	}
	for(var i = 0; i < firstProps.length; i++){
		var propName = firstProps[i];
		if(propName == ignore) {continue;}
		if(first[propName] !== second[propName]){
			return false;
		}
	}
	return true;
}