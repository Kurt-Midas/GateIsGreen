var config = require('config');
var utils = require('../src/Utils.js');
// var sso = require('./SSOHandler');
var sessionManager = require('./SessionDbManager');
var url = require('url');
//TODO: decouple stuff to implement walkable API
var viewHandler = require('../src/viewHandler');

const CREST = config.get('CREST');

// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({extended:true}));

module.exports = {
	getFleetInfo : function(key, callback){
		sessionManager.getSessionDetails(key, function(err, details){
			if(err){
				console.error("Error in getAuthOptionsSeed:", err);
				callback(err);
				return;
			}
			if(!details || !details.key || !details.fleetid || !details.authtoken || !details.refreshtoken || !details.created){
				console.error("Not all details are present:", details);
				callback("Not all details are present");
				return;
			}
			var authHeader = {"Authorization": "Bearer " + details.authtoken}
			var urlObj = {
				protocol: 'https',
				host: 'crest-tq.eveonline.com',
				pathname: '/fleets/' + details.fleetid + '/'
			}
			var fleetOptions = {
				url: url.format(urlObj),
				headers: authHeader
			}
			utils.remoteGet(fleetOptions, function(fleetErr, fleetBody){
				if(fleetErr){
					console.error("Failed to get base fleet URL:", fleetErr)
					callback("Failed to call fleet endpoint");
					return;
				}
				//TODO: handle fleetBody
				//also fleetBody.wings.href and stuff
				var memberOptions = {
					url: fleetBody.members.href,
					headers: authHeader
				}
				utils.remoteGet(memberOptions, function(memberErr, memberBody){
					if(memberErr){
						console.error("Failed at member endpoint:", memberErr);
						console.error("Failed to call member endpoint");
					}
					callback(null, {
						fleetinfo: 		viewHandler.getFleetDisplay(fleetBody),
						members: 		viewHandler.getMemberDisplay(memberBody)
					})
					return;
				})
			})
		})
		// utils.remoteGet(options, callback)
	}
}

// var maxTokenAge = 1200000; //20 minutes
// var acceptableTokenAge = 900000; //15 minutes