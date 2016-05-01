/*
/fleets/fleetID:integerType/members/ *
	Member info. Includes (not limited to)
		Fleet Warp?
		Join time
		role
		booster?
		ship type
		location
		position in fleet
	POST to invite [to wings/squads]
/fleets/fleetID:integerType/members/memberID:characterIdType/
	PUT to move around, DELETE to kick
*/

// var http = require('http');
// var bodyParser = require('body-parser');
var config = require('config');
var utils = require('../src/Utils.js')

const CREST = config.get('CREST');

// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({extended:true}));

/* ASSUMPTION
[{	"memberID":#charid:integer,
	"fleetwarp":#takesFleetWarp:boolean,
	"role":#role:string?,
	"booster":#isBooster:boolean,
	"shipType":#shipTypeID:integer,
	"location":#solarSystemID:integer,
	"fleetPosition":#fleetPosition:integer?	}]*/
/**
 * Makes a call to get /fleets/fleetID:integerType/members endpoint and fires the callback on a JSONified result
 * @param  {[type]} fleetID [description]
 * @return {[type]}         [description]
 */
function getAllFleetMemberInfo(fleetID, callback){
	var options = {
		host: CREST.BASE,
		path: "/fleets/" + fleetID + "/members/",
		Authorization: "Bearer " + CREST.AUTH_KEY,
		Accept: "application/vnd.ccp.eve.Api-v3+json"
	};
	console.log("options:", options);
	utils.remoteApiCaller(options, callback);
}

var service = {};
service.getAllFleetMemberInfo = getAllFleetMemberInfo;

module.exports = service;