
module.exports = {
	getMemberDisplay: function(memberResponse){
		if(!memberResponse || !memberResponse.items){
			console.error("No fleet members?! Quite impossible. Error case or deleted fleet?", memberResponse)
			return null;
		};
		var membersArray = [];
		for(var i = 0; i < memberResponse.items.length; i++){
			if(!memberResponse.items[i].character || !memberResponse.items[i].solarSystem){
				console.error("Failed to find character or location information, printing:", memberResponse.items[i]);
				continue;
			};
			if(memberResponse.items[i].roleName && memberResponse.items[i].roleName.includes('(Boss)')){
				console.log("ViewHandler :: getMemberDisplay :: Fleet Boss Name is '", 
					memberResponse.items[i].character.name,"'");
			} 
			var member = {
				"chaId"	: 			memberResponse.items[i].character.id_str,
				"chaName":			memberResponse.items[i].character.name,
				"shipId":			memberResponse.items[i].ship.id_str,
				"systemid":			memberResponse.items[i].solarSystem.id_str,
				"station":			memberResponse.items[i].station.name,
				"takesFleetWarp": 	memberResponse.items[i].takesFleetWarp,
				"wingID":			memberResponse.items[i].wingID_str,
				"squadID":			memberResponse.items[i].squadID_str,
				"boosterID":		memberResponse.items[i].boosterID_str,
				"roleID":			memberResponse.items[i].roleID_str,
				"boosterName":		memberResponse.items[i].boosterName,
				"roleName":			memberResponse.items[i].roleName,
				"joinTime":			memberResponse.items[i].joinTime
			}
			membersArray.push(member);
		};
		return membersArray;
	},
	getFleetDisplay: function(fleetResponse){
		if(!fleetResponse){
			console.error("No argument passed to getFleetDisplay:", fleetResponse)
			return null;
		}

		return {
			isVoiceEnabled:	fleetResponse.isVoiceEnabled,
			motd: 			fleetResponse.motd,
			isFreeMove: 	fleetResponse.isFreeMove,
			isRegistered: 	fleetResponse.isRegistered
		};
		// fleetResponse.members.href //not part of display
		// fleetResponse.wings.href; //not part of display
	},
	getWingDisplay : function(wingResponse){
		if(!wingResponse || !wingResponse.items){
			console.error("No wings?! Quite impossible. Error case or deleted fleet?", wingResponse)
			return null;
		}
		var wings = {};
		for(var i = 0; i < wingResponse.items.length; i++){
			var wing = {};
			wing.name 		= wingResponse.items[i].name;
			wing.id 		= wingResponse.items[i].id_str
			wing.squads 	= {}
			for(var j = 0; j < wingResponse.items[i].squadsList.length; j++){
				wing.squads[wingResponse.items[i].squadsList[j].id_str]
					= wingResponse.items[i].squadsList[j].name;
			}
			wings[wingResponse.items[i].id_str] = wing;
		}
		return wings;
	},
	getAffiliationsDisplay : function(affResponse){
		console.log("getAffiliationsDisplay :: affResponse", affResponse);
		return "not implemented";
	}
}