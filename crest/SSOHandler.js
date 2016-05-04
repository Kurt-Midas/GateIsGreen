/*
	1.	Receive a request from the user. Some parts of the request are saved in an in-memory sqlite3 database (known format). 
		fleetid, auth_token, refresh_token, index(sha1())
		Endpoint responds with res.redirect(301, '#CREST_LOGIN' + args and stuff + localhost:#PORT' + req.path and stuff)
			state is the nosql id
	2.	AngularJS has a route to catch the response from the SSO
		Turns state into nosql call
		nosql contains {fleetid, auth_token, refresh_token}
 */

// var express = require('express');
// var router = express.Router();
// var app = express();
var config = require('config');
var sha1 = require('sha1');
// var bodyParser = require('body-parser');
// var request = require('request');
var url = require('url');
var utils = require('../src/Utils')

// router.use(bodyParser.json());


var sessionManager = require('./SessionDbManager')

// const REDIRECT = 301;
// const BAD_DEVELOPER = 500;

/**
 * Creates a session egg from a numeric fleetid. Returns an external URL: UI must handle redirection.
 * @param  {[type]} req                       [needs 'body.fleetid']
 * @param  {[type]} res
 */
/*router.post('/createFleet', function(req, res){
	if(!req.body.fleetid){
		res.status(MISSING_DATA).send("Missing required field:fleetid");
		//TODO: verify numeric. This is put into API calls, highly unsafe
	}
	sessionManager.createSetupStateEgg(req.body.fleetid, function(dberr, state){
		if(dberr){
			console.error("Error creating session egg:", dberr);
			res.status(BAD_DEVELOPER).send("Failed to create session egg. This is bad, please contact the dev");
		}
		var ssoLink = config.CREST.SSO_URL
			+ "/?response_type=code"
			+ "&redirect_uri=http://localhost:3000/setup/initialize" //TODO: config this shit
			+ "&client_id=" + config.CREST.APP_ID
			+ "&scope=fleetWrite+fleetRead"
			+ "&state="+state;
		console.log("ssoLink:",ssoLink);
		res.status(200).send({"redirect":ssoLink});
	})
});*/

/**
 * Exchanges an auth token for an access token and refresh token
 * @param  {[type]}   authToken [working auth token]
 * @param  {Function} callback  [Parameters: (Error object, Access Token, Refresh Token)]
 */
function exchangeAuthToken(authToken, callback){
	var urlObj = {
		protocol: 'https',
		host: 'login-tq.eveonline.com',
		pathname: '/oauth/token'
	}
	var ssoTokenUrl = url.format(urlObj);
	var concat = config.CREST.APP_ID + ":" + config.CREST.APP_KEY;
	var tokenAuthHeaderString = "Basic " + new Buffer(concat, 'utf8').toString('base64');

	var postOptions = {
		url: ssoTokenUrl,
		headers:{
			"Authorization": tokenAuthHeaderString
		},
		form:{
			grant_type: "authorization_code",
			code: authToken
		}
	}
	utils.remotePost(postOptions, function(postErr, bodyObj){
		if(postErr){
			console.error("Call failed with error:", postErr);
			callback(err);
			return;
		}
		console.log("No error exchanging auth token for access token");
		callback(null, bodyObj.access_token, bodyObj.refresh_token);
	})
} //use something similar for refresh token?

module.exports = {
	/**
	 * Creates a session egg from a numeric fleetid. Returns an external URL: UI must handle redirection.
	 * @param  {[type]} req                       [needs 'body.fleetid']
	 * @param  {[type]} res
	 */
	beginHandshake : function(fleetid, callback){
		sessionManager.createSetupStateEgg(fleetid, function(dberr, state){
			if(dberr){
				console.error("Error creating session egg:", dberr);
				callback(dberr);
				return;
			}
			var ssoLink = config.CREST.SSO_URL
				+ "/?response_type=code"
				+ "&redirect_uri=http://localhost:3000/handshake/completeHandshake" //TODO: config this shit
				+ "&client_id=" + config.CREST.APP_ID
				+ "&scope=fleetWrite+fleetRead"
				+ "&state="+state;
			console.log("ssoLink:", ssoLink);
			callback(null, ssoLink);
		})
	},
	
	/**
	 * Catches the return from the Eve SSO and creates a fleet session from an existing setup egg. Returns the db key to the UI
	 * @param  {[type]} req                     [Request object. Needs query.state and query.code]
	 * @param  {[type]} res){	console.log("Got callback      from SSO to 'request' package method:");	console.log("Query:", req.query);	console.log("Headers:", req.headers);	console.log("Params:", req.params);	var state [description]
	 * @return {[type]}                         [description]
	 */
	completeHandshake : function(state, code, callback){
		sessionManager.checkStateEggExists(state, function(stateErr, fleetid){
			//Checks for handshake setup. Gives a fleetid from a matching setup or gets an error
			if(stateErr){
				console.error("State Error:", stateErr);
				callback("Failed to find handshake initialization. Likely cause is an application restart or that you suck");
				return;
			}
			exchangeAuthToken(code, function(authErr, authToken, refreshToken){
				//turns the auth token aka 'code' into an access and refresh token or gets an error
				if(authErr){
					console.error("Auth Error:", authErr);
					callback("Auth token may be expired or invalid");
					return;
				}
				//state + fleetid is unsafe
				//Fleetids appear to be sequential-ish
				//finding the registred appID or intercepting state allows walking the possible keys
				var key = sha1(state + fleetid);
				var info = {
					"key": key,
					"fleetid": fleetid,
					"authToken": authToken,
					"refreshToken": refreshToken
				}
				// console.log(info);
				sessionManager.createFleetDBSession(info, function(persistErr, dbKey){
					//creates a database entry for a fleet session. Errors are unlikely and probably very bad
					if(persistErr){
						console.error("Persist Error:", persistErr);
						callback("Failed to create a fleet session. This is likely an internal error");
						return;
					}
					callback(null, dbKey);
					/*var members = require('./Members');
					members.getFleetInfo(key, function(memberErr, result){
						if(memberErr){
							res.status(500).send("didn't work, check logs");
						}
						res.status(200).send(result);
					})*/
				})
			})
		})
	} 
} /* END of module.exports */



/**
 * Catches the return from the Eve SSO and creates a fleet session from an existing setup egg. Returns the db key to the UI
 * @param  {[type]} req                     [Request object. Needs query.state and query.code]
 * @param  {[type]} res){	console.log("Got callback      from SSO to 'request' package method:");	console.log("Query:", req.query);	console.log("Headers:", req.headers);	console.log("Params:", req.params);	var state [description]
 * @return {[type]}                         [description]
 */
/*router.get('/initialize', function(req, res){
	console.log("Got callback from SSO to 'request' package method:");
	// console.log("Query:", req.query);
	var state = req.query.state;

	sessionManager.checkStateEggExists(state, function(stateErr, fleetid){
		if(stateErr){
			console.log("State Error:", stateErr);
			res.status(500).send("State Error. Setup egg may not exist, no fleetid found.");
		}
		exchangeAuthToken(req.query.code, function(authErr, authToken, refreshToken){
			if(authErr){
				console.log("Auth Error:", authErr);
				res.status(500).send("Auth Error. Are you the fleet boss?"); //todo, figure out if rejection is from this
			}
			var key = sha1(state + fleetid);
			var info = {
				// "key": sha1(state + fleetid),
				"key": key,
				"fleetid": fleetid,
				"authToken": authToken,
				"refreshToken": refreshToken
			}
			console.log(info);
			sessionManager.createFleetDBSession(info, function(persistErr, dbKey){
				if(persistErr){
					console.log("Persist Error:", persistErr);
					res.status(500).send("Persist Error");
				}
				// res.status(200).send(dbKey);
				//temporary change
				var members = require('./Members');
				members.getFleetInfo(key, function(memberErr, result){
					if(memberErr){
						res.status(500).send("didn't work, check logs");
					}
					res.status(200).send(result);
				})
			})
		})
	})
})*/

// module.exports = router;