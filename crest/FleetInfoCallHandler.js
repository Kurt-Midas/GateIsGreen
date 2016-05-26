var config = require('config');
var utils = require('../src/Utils.js');
var sessionManager = require('./SessionDbManager');
var url = require('url');
//TODO: decouple stuff to implement walkable API
var viewHandler = require('../src/viewHandler');

var pUtils = require('../src/PromiseUtils.js');

const CREST = config.get('CREST');

module.exports = {
	getFleetInfo : function(key, callback){
		console.log("FleetInfoCallHandler :: getFleetInfo_parallel,", key);
		sessionManager.getSessionDetails(key, function(err, details){
			if(err){
				console.error("Error in getAuthOptionsSeed:", err);
				callback(err);
				return;
			}
			if(!details || !details.key || !details.fleetid || !details.accessToken || !details.refreshtoken || !details.created){
				console.error("FleetInfoCaller :: getFleetInfo err, not all details are present:", details);
				callback("Not all details are present");
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
				console.error("getFleetInfo_parallel :: fail reason:", reason);
				callback(reason);
			}).catch(function(err){
				console.error("getFleetInfo_parallel :: caught error:", err);
				callback(err);
			})
		})
	},
	getFleetInfo_sequential : function(key, callback){
		console.log("FleetInfoCallHandler :: getFleetInfo,", key);
		sessionManager.getSessionDetails(key, function(err, details){
			if(err){
				console.error("Error in getAuthOptionsSeed:", err);
				callback(err);
				return;
			}
			if(!details || !details.key || !details.fleetid || !details.accessToken || !details.refreshtoken || !details.created){
				console.error("FleetInfoCaller :: getFleetInfo err, not all details are present:", details);
				callback("Not all details are present");
				return;
			}
			var authHeader = {"Authorization": "Bearer " + details.accessToken}
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
				//members
				var memberOptions = {
					url: fleetBody.members.href,
					headers: authHeader
				}
				utils.remoteGet(memberOptions, function(memberErr, memberBody){
					if(memberErr){
						console.error("Failed at member endpoint:", memberErr);
						callback(memberErr);
						return;
					}
					

					//wings
					var wingOptions = {
						url: fleetBody.wings.href,
						headers: authHeader
					}
					utils.remoteGet(wingOptions, function(wingErr, wingBody){
						if(wingErr){
							console.error("Failed to call wing endpoint at", wingErr)
							callback(memberErr);
							return;
						}
						callback(null, {
							fleetinfo: 		viewHandler.getFleetDisplay(fleetBody),
							members: 		viewHandler.getMemberDisplay(memberBody),
							wings: 			viewHandler.getWingDisplay(wingBody)
						})
/*
						//affiliations
						var memberIdString = memberBody.items[0].character.id_str;
						for(var i=1; i < memberBody.items.length; i++){
							memberIdString = ","+memberBody.items[i].character.id_str
						}
						var affiliationOptions = {};
						affiliationOptions.url = 
							"api.eveonline.com/eve/CharacterAffiliation.xml.aspx?ids=" + memberIdString;

						utils.remoteGet(affiliationOptions, function(affErr, affBody){
							if(affErr){
								console.error("Error calling affiliations api", affErr);
								callback(affErr);
								return;
							}
							callback(null, {
								fleetinfo: 		viewHandler.getFleetDisplay(fleetBody),
								members: 		viewHandler.getMemberDisplay(memberBody),
								wings: 			viewHandler.getWingDisplay(wingBody),
								affiliations: 	viewHandler.getAffiliationsDisplay(affBody)
							})
						})*/

					})

				})
			})
		})
		// utils.remoteGet(options, callback)
	}
}