var sqlite3 = require('sqlite3').verbose();
var sha1 = require('sha1');
var config = require('config');

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
	+"authtoken varchar(100) DEFAULT NULL,"
	+"refreshtoken varchar(100) DEFAULT NULL,"
	+"created integer DEFAULT NULL,"
	+"PRIMARY KEY (key))");

var maxTokenAge = 1200000; //20 minutes
var acceptableTokenAge = 900000; //15 minutes
//might want to config this stuff

module.exports = {
	createSetupStateEgg: function(fleetid, callback){
		var state = sha1(config.CREST.APP_ID + fleetid);
		db.run('INSERT INTO setup (state, fleetid, created) VALUES (?,?,?)',
		 [state, fleetid, new Date().getTime()],
		 function(insertError){
		 	/*if(insertError){
		 		console.error("Failed to create setup egg", insertError);
		 		// res.status(BAD_DEVELOPER).send("Please report to developer");
		 		callback(insertError, state);
		 	}
		 	callback(null, state);*/
		 	callback(insertError, state);
		 });
	},
	checkStateEggExists: function(state, callback){
		db.get('SELECT * FROM setup WHERE state=?',[state], function(dbErr, row){
			if(!row || dbErr){
				callback(dbErr);
				return;
			}
			callback(null, row.fleetid);
		})
	},
	createFleetDBSession: function(info, callback){ //info has key, fleetid, authToken, refreshToken
		if(!info || !info.authToken || !info.refreshToken || !info.key || !info.fleetid){
			callback("Bad usage of createFleetDBEntry: missing parameter in 'info' object");
		}
		db.run("INSERT INTO fleets VALUES (?,?,?,?,?)", 
			[info.key, info.fleetid, info.authToken, info.refreshToken, new Date().getTime()],
			function(insertErr){
				if(insertErr){
					callback(insertErr)
				}
				callback(null, info.key)
			}
		)
	},
	getSessionDetails : function(key, callback){
		if(!key){
			callback("No key provided", null);
		}
		db.get('SELECT * FROM fleets WHERE key=?', [key], function(dbErr, row){
			if(!row || dbErr){
				callback(dbErr, null);
				return;
			}
			// console.log("Got session from db:", row);
			//should be key, fleetid, authToken, refreshToken, created at UTC millis
			var age = new Date().getTime - row.created;
			if(age > acceptableTokenAge){
				//TODO: refresh auth token
				console.warn("This key is approaching/past end-of-life");
				callback(null, row);
			} else {
				console.log("Still a young token");
				callback(null, row);
			}
		})
	},
	replaceAuthToken : function(key, authToken, callback){
		if(!key || !authToken){
			callback("Missing parameters to replaceAuthToken method");
		}
		db.run("UPDATE fleets SET authtoken = ? WHERE key = ?",
			[authToken, key],
			function(dbErr){
				callback(dbErr)
			}
		)
	}
}