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
//might want to config this stuff

module.exports = {
	createSetupStateEgg: function(fleetid, callback){
		console.log("SessionDBManager :: createSetupStateEgg, Args:", fleetid);
		var state = sha1(config.CREST.APP_ID + fleetid);
		db.run('INSERT INTO setup (state, fleetid, created) VALUES (?,?,?)',
		 [state, fleetid, new Date().getTime()],
		 function(insertError){
		 	callback(insertError, state);
		 });
	},
	checkStateEggExists: function(state, callback){
		console.log("SessionDBManager :: checkStateEggExists, Args:", state);
		//TODO: delete the entry
		db.get('SELECT * FROM setup WHERE state=?',[state], function(dbErr, row){
			if(!row || dbErr){
				callback(dbErr);
				return;
			}
			callback(null, row.fleetid);
		})
	},
	createFleetDBSession: function(key, fleetid, accessToken, refreshToken, callback){
		console.log("SessionDBManager :: createFleetDBSession, Args:", key, fleetid, accessToken, refreshToken);
		if(!accessToken || !refreshToken || !key || !fleetid){
			callback("Bad usage of createFleetDBEntry: missing parameters", key, fleetid, accessToken, refreshToken);
		}
		db.run("INSERT INTO fleets VALUES (?,?,?,?,?)", 
			[key, fleetid, accessToken, refreshToken, new Date().getTime()],
			function(insertErr){
				if(insertErr){
					callback(insertErr)
				}
				callback(null, key)
			}
		)
	},
	getSessionDetails : function(key, callback){
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
			// console.log("GetSessionDetails:: Age checking: ", new Date().getTime(), row.created, age);
			if(age > acceptableTokenAge){
				//TODO: refresh auth token
				console.warn("This key is approaching/past end-of-life. Refreshing token");
				ssoHandler.exchangeRefreshToken(row.refreshtoken, function(refreshErr, newToken){
					if(refreshErr){
						console.error("Failed to refresh token with error", refreshErr);
						callback("Token refresh failed. TODO: terminate session");
						return;
					}
					replaceAccessToken(key, newToken, callback);
					return;
				})
			} else {
				// console.log("Still a young token");
				callback(null, row);
				return;
			}
		})
	}
}

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