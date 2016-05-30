var config = require('config');
var pUtils = require('../src/PromiseUtils.js');
var sessionManager = require('./SessionDbManager');
var url = require('url');
//TODO: decouple stuff to implement walkable API

var viewHandler = require('../src/viewHandler');

const CREST = config.get('CREST');

module.exports = {
	getFleetInfo : function(key, callback){
		console.log("FleetInfoCallHandler :: getFleetInfo_parallel,", key);
		sessionManager.getSessionDetails(key, function(err, details){
			if(err){
				console.error("Error in getAuthOptionsSeed:", err);
				callback("Session retrieval failed, session may not exist");
				return;
			}
			if(!details || !details.key || !details.fleetid || !details.accessToken || !details.refreshtoken || !details.created){
				console.error("FleetInfoCaller :: getFleetInfo err, not all details are present:", details);
				callback("Session retrieval failed, session may not exist");
				return;
			}
			var authHeader = {"Authorization": "Bearer " + details.accessToken}
			var fleetUrl = url.format({protocol: 'https', 
				host: 'crest-tq.eveonline.com', pathname: '/fleets/' + details.fleetid + '/'})
			var membersUrl = url.format({protocol: 'https', 
				host: 'crest-tq.eveonline.com', pathname: '/fleets/' + details.fleetid + '/members/'})
			var wingsUrl = url.format({protocol: 'https', 
				host: 'crest-tq.eveonline.com', pathname: '/fleets/' + details.fleetid + '/wings/'})
			var fleetOptions = {'uri' : fleetUrl, 'headers' : authHeader, 'json' : true}
			var membersOptions = {'uri' : membersUrl, 'headers' : authHeader, 'json' : true}
			var wingsOptions = {'uri' : wingsUrl, 'headers' : authHeader, 'json' : true}
			Promise.all([
				pUtils.remoteCall(fleetOptions),
				pUtils.remoteCall(membersOptions),
				pUtils.remoteCall(wingsOptions)])
			.then(function(values){
				console.log("getFleetInfo_parallel :: successful Promise.all([])");
				callback(null, {
					fleetinfo: 	viewHandler.getFleetDisplay(values[0]),
					members: 	viewHandler.getMemberDisplay(values[1]),
					wings: 		viewHandler.getWingDisplay(values[2])
				})
			}, function(reason){
				// console.error("FleetInfoCallHandler :: getFleetInfo_parallel :: failed with reason '",
				// 	reason,"' as reason, terminating session");
				// console.error(reason.response, " response");
				//Terminate Session
				console.error("FleetInfoCaller :: getFleetInfo_parallel :: failed at reason, terminating session");
				sessionManager.terminateFleetDBSession(key);
				// callback("Fleet Session Terminated : failure during fleet info calls");
				// callback(reason);
			}).catch(function(promiseErr){
				// console.error("FleetInfoCallHandler :: getFleetInfo_parallel :: caught error '",
					// promiseErr,"' as error, terminating session");
				//Terminate Session
				console.error("FleetInfoCaller :: getFleetInfo_parallel :: failed at error, terminating session");
				sessionManager.terminateFleetDBSession(key);
				// callback("Fleet Session Terminated : error during fleet info calls");
				// callback(promiseErr);
			})
		})
	}
}