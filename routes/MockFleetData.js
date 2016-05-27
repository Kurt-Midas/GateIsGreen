var express 	= require('express');
var router 		= express.Router();
var bodyParser 	= require('body-parser');
router.use(bodyParser.json());

var cerbFleet = [
	{"ship":29984, "number":1}, //Tengu, FC
	{"ship":11993, "number":10}, //Squad 1, Cerbs
	{"ship":11993, "number":10}, //Squad 2, Cerbs
	{"ship":11978, "number":8}, //Squad 3, Scimitars
	{"ship":11176, "number":6}, //Squad 4, Crow
	{"ship":22456, "number":3} //Squad 5, Sabre
]

//...I just realized I don't know how fleets work. TIL I suck at Eve

router.get('/getMockCerbFleet/:fleetSessionId', function(req, res){
	console.log("inside getMockCerbFleet");
	var fleet = cerbFleet;
	var members = [];
	members.push(createFleetMember(
		fleet[0].ship.toString(), "-1", "-1", "1", "Fleet Booster", "1", "Fleet Commander (Boss)"));
	// console.log("About to create wings:", fleet.length);
	var wings = {};
	// wings["1234"] = { "name" : "LeaderWing", "id" : "1234", "squads" : [] }
	for(var i = 1; i < fleet.length; i++){
		// console.log("Iterating over createSquad");
		var wingNumber = Math.floor(Math.random() * 10000 + 2159611200000);
		var squadNumber = Math.floor(Math.random() * 10000 + 3251811200000);
		squads = {};
		squads[squadNumber.toString()] = "Squad 1";
		wing = {};
		wing.name = "Wing " + (i+1);
		wing.id = wingNumber.toString();
		wing.squads = squads;
		wings[wingNumber.toString()] = wing;
		members = members.concat(createSquad(fleet[i].ship, fleet[i].number, wingNumber,
			squadNumber.toString()));
	}
	res.status(200).send({
		"fleetinfo":{
			"isVoiceEnabled": false,
			"motd" : "",
			"isFreeMove": true,
			"isRegistered": true
		},
		"members": members,
		"wings": wings
	})
})

function createSquad(ship, number, wingid, squadid){
	var members = [];
	// console.log("Creating squad with size:", number);
	members.push(createFleetMember(ship, wingid, squadid, "3", "Squad Booster", "3", "Squad Leader"))
	for(var i = 0; i < number; i++){
		members.push(createFleetMember(ship, wingid, squadid, "0", "", "4", "Squad Member"))
	}
	return members;
}

function createFleetMember(ship, wingid, squadid, boosterid, boostername, roleid, roleName){
	var cha = {}
	cha.chaId = (95095000 + Math.floor(Math.random() * 100000)).toString()
	cha.chaName = firstNames[Math.floor(Math.random() * 10)]
			+ " " + lastNames[Math.floor(Math.random() * 10)]
			+ " " + Math.floor(Math.random() * 100);
	cha.shipId = ship;
	cha.systemid = systems[Math.floor(Math.random() * 4)];
	cha.station = "";
	cha.takesFleetWarp = Math.floor(Math.random() * 6) > 0 ? true : false;
	cha.wingID = wingid;
	cha.squadID = squadid;
	cha.boosterID = boosterid;
	cha.boosterName = boostername;
	cha.roleID = roleid;
	cha.roleName = roleName;
	cha.joinTime = new Date().toString();
	return cha;
}

var firstNames = ["Paul", "Bill", "Durr", "Dumb", "Smart", 
	"Lord", "Killer", "Red", "Archer", "XxXXx"];
var lastNames = ["Archer", "Smith", "DeVille", "Beast", "Nope",
	"Hurr", "xXXxX", "Random", "DUMB", "Penguins"]
var systems = ["30001835", "30002960", "30002187", "30001198"] //GERUSALEM THE PROMISED LAND, LOST BUT NOT FORGOTTEN

module.exports = router;