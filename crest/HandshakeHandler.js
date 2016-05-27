var config = require('config');
var sha1 = require('sha1');
var url = require('url');

var sessionManager = require('./SessionDbManager');
var ssoHandler = require('./SSOHandler');

module.exports = {
	/**
	 * Creates a session egg from a numeric fleetid. Returns an external URL: UI must handle redirection.
	 * @param  {[type]} req                       [needs 'body.fleetid']
	 * @param  {[type]} res
	 */
	beginHandshake : function(fleetid, callback){
		console.log("HandshakeHandler :: beginHandshake, args:", fleetid);
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
		console.log("HandshakeHandler :: completeHandshake, args:", state, code);
		sessionManager.checkStateEggExists(state, function(stateErr, fleetid){
			//Checks for handshake setup. Gives a fleetid from a matching setup or gets an error
			if(stateErr){
				console.error("State Error:", stateErr);
				callback("Failed to find handshake initialization. Likely cause is an application restart or that you suck");
				return;
			}
			ssoHandler.exchangeAuthToken(code, function(authErr, authToken, refreshToken){
				//turns the auth token aka 'code' into an access and refresh token or gets an error
				if(authErr){
					console.error("Auth Error:", authErr);
					callback("Auth token may be expired or invalid");
					return;
				}
				//state + fleetid may be unsafe
				//FleetIDs appear to have a limited range (not sequential)
				//finding the registred appID or intercepting state allows walking the possible keys
				var key = sha1(state + fleetid);
				sessionManager.createFleetDBSession(key, fleetid, authToken, refreshToken, function(persistErr, dbKey){
					//creates a database entry for a fleet session. Errors are unlikely and probably very bad
					if(persistErr){
						console.error("Persist Error:", persistErr);
						callback("Failed to create a fleet session. This is likely an internal error");
						return;
					}
					callback(null, dbKey);
				})
			})
		})
	} 
} /* END of module.exports */


