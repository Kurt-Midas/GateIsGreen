var sqlite3 = require('sqlite3').verbose();
var sha1 = require('sha1');
var config = require('config');

var ssoHandler = require('./SSOHandler');

var db = new sqlite3.Database(':memory:','', function(openErr){ //may need to specify types
	if(openErr){
		console.error("Failed creating in-memory storage", openErr);
		process.exit(1);
	}
	console.log("Successfully created in-memory storage");
}).run("CREATE TABLE setup (state varchar(40) NOT NULL, "
	+"fleetid integer NOT NULL, "
	+"created integer NOT NULL, "
	+"PRIMARY KEY(state))"
).run("CREATE TABLE fleets ("
	+"key varchar(40) NOT NULL,"
	+"fleetid integer DEFAULT NULL,"
	+"accessToken varchar(100) DEFAULT NULL,"
	+"refreshtoken varchar(100) DEFAULT NULL,"
	+"created integer DEFAULT NULL,"
	+"PRIMARY KEY (key))");

var maxTokenAge = 1200000; //20 minutes
var acceptableTokenAge = 900000; //15 minutes
// var acceptableTokenAge = 60000; //1 minute
//TODO: config this stuff

function replaceAccessToken(key, accessToken, callback){
	console.log("SessionDBManager :: replaceAccess token. Args:", key, accessToken);
	if(!key || !accessToken){
		callback("Missing parameters to replaceAuthToken method");
	}
	db.run("UPDATE fleets SET accessToken = ?, created = ? WHERE key = ?", 
		[accessToken, new Date().getTime(), key], function(updateDBErr){
		if(updateDBErr){	
			callback(updateDBErr)
			return;
		}
		db.get('SELECT * FROM fleets WHERE key=?', [key], function(selectDBErr, row){
			if(!row || selectDBErr){
				callback(selectDBErr, null);
				return;
			}
			callback(null, row);
			return;
		})
	})
}

var modExports = {};
modExports.createSetupStateEgg = function(fleetid, callback){
		console.log("SessionDBManager :: createSetupStateEgg, Args:", fleetid);
		var state = sha1(config.CREST.APP_ID + fleetid);
		db.run('REPLACE INTO setup (state, fleetid, created) VALUES (?,?,?)',
		 [state, fleetid, new Date().getTime()],
		 function(insertError){
		 	callback(insertError, state);
		 });
	}
modExports.checkStateEggExists = function(state, callback){
		console.log("SessionDBManager :: checkStateEggExists, Args:", state);
		db.get('SELECT * FROM setup WHERE state=?',[state], function(dbErr, row){
			if(!row || dbErr){
				callback(dbErr);
				return;
			}
			callback(null, row.fleetid);
		})
		//TODO: verify deletion works here
		db.run('DELETE FROM setup WHERE state=?',[state], function(dbErr){
			console.log("SessionDBManager :: checkStateEggExists :: inside call to delete state egg");
			if(dbErr){
				console.error("Failed to delete session egg with state", 
					state,", cause is:", dbErr);
			}
		})
	}
modExports.createFleetDBSession = function(key, fleetid, accessToken, refreshToken, callback){
		console.log("SessionDBManager :: createFleetDBSession, Args:", key, fleetid, accessToken, refreshToken);
		if(!accessToken || !refreshToken || !key || !fleetid){
			callback("Bad usage of createFleetDBEntry: missing parameters", key, fleetid, accessToken, refreshToken);
		}
		db.run("REPLACE INTO fleets VALUES (?,?,?,?,?)", 
			[key, fleetid, accessToken, refreshToken, new Date().getTime()],
			function(insertErr){
				if(insertErr){
					callback(insertErr)
				}
				callback(null, key)
			}
		)
	},
modExports.terminateFleetDBSession = function(key){
		console.log("SessionDBManager :: terminateFleetDBSession with key", key);
		db.run("DELETE FROM fleets WHERE key=?", [key], function(dbErr){
			if(dbErr){
				console.error("SessionDBManager :: terminateFleetDBSession :: Failed to delete fleet session with cause", dbErr);
			} else {
				console.log("SessionDBManager :: terminateFleetDBSession :: should have succesfully deleted session");
			}
		})
	}
modExports.getSessionDetails = function(key, callback){
		console.log("SessionDBManager :: getSessionDetails, Key:", key)
		if(!key){
			callback("No key provided", null);
		}
		db.get('SELECT * FROM fleets WHERE key=?', [key], function(dbErr, row){
			if(!row || dbErr){
				callback(dbErr, null);
				return;
			}
			var age = new Date().getTime() - row.created;
			if(age > acceptableTokenAge){
				console.warn("This access token is approaching/past end-of-life. Refreshing token");
				ssoHandler.exchangeRefreshToken(row.refreshtoken, function(refreshErr, newToken){
					if(refreshErr){
						console.error("Failed to refresh token with error", refreshErr);
						modExports.terminateFleetDBSession(key)
						callback("Fleet session terminated: failed to refresh access token");
					} else{
						replaceAccessToken(key, newToken, callback);
					}
					return;
				})
			} else {
				// console.log("Still a young token");
				callback(null, row);
				return;
			}
		})
	}

module.exports = modExports;