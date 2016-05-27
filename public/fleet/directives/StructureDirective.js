var module = angular.module('StructureDirectiveModule',
    ['FleetDataModule'])

module.directive('structureDirective',[function () {
    return {
        restrict: 'E',
        templateUrl: '/fleet/partials/Structure.html',
        replace: true,
        scope: {},
        controllerAs: 'str',
        controller: ['$scope', 'FleetInfo', function($scope, FleetInfo){
        	var str = this;
            str.fleetStructure = buildFleetStructure();
            /**
             * Creates independent object for structure (does not modify FleetInfo)
             * iterates over members and inserts them into the structure object
             *     chaName, shipType, system, booster, role, boss, fleetwarps, isDocked
             * @return {[type]} [description]
             */
            function buildFleetStructure(){
                console.log("Inside buildFleetStructure");
                var fleetStructure = {}
                fleetStructure.wings = {};
                angular.forEach(FleetInfo.getWings(), function(wingInfo, wingID){
                    console.log("Iterating over wings:", wingID, wingInfo);
                    // fleetStructure.leader = {};
                    fleetStructure.wings[wingID] = {};
                    fleetStructure.wings[wingID].name = wingInfo.name;
                    // fleetStructure.wings[wingID].leader = {};
                    fleetStructure.wings[wingID].squads = {};
                    angular.forEach(wingInfo.squads, function(squadName, squadID){
                        console.log("Iterating over squads:", squadName, squadID);
                        fleetStructure.wings[wingID].squads[squadID] = {};
                        fleetStructure.wings[wingID].squads[squadID].name = squadName;
                        fleetStructure.wings[wingID].squads[squadID].leader = {};
                        fleetStructure.wings[wingID].squads[squadID].members = [];
                    })
                })
                console.log("buildFleetStructure :: after fleetStructure loop");
                angular.forEach(FleetInfo.getMembers(), function(member){
                    var pilot = {
                        "chaName" : member.chaName,
                        "shipName" : member.shipName,
                        "system" : member.system,
                        "boosterName" : member.boosterName,
                        "roleID" : member.roleID,
                        "takesFleetWarp" : member.takesFleetWarp,
                        "station" : member.station
                    }
                    if(member.wingID == -1){
                        //fleet leader, has no wing or squad
                        fleetStructure.leader = pilot;
                    }
                    else{
                        if(member.squadID == -1){
                            //wing leader, has no squad
                            fleetStructure.wings[member.wingID].leader = pilot;
                        }
                        else if (member.roleID == "3"){
                            //squad leader
                            fleetStructure.wings[member.wingID].squads[member.squadID].leader = pilot;
                        } else{
                            //squad member
                            fleetStructure.wings[member.wingID].squads[member.squadID].members.push(pilot);
                        }
                    }
                }) 
                return fleetStructure;
            }

            $scope.$on('refreshed-fleet-data', function(){
                console.log("structureDirective :: heard refresh event");
                str.fleetStructure = buildFleetStructure();
            })
        }]
    };
}]);