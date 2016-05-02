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

module.exports = {
	createFleetDBEntry: function createFleetDBEntry(info, callback){ //info has key, fleetid, authToken, refreshToken
		if(!info || !info.authToken || !info.refreshToken || !info.key || !info.fleetid){
			callback("Bad usage of createFleetDBEntry: missing parameter in 'info' object");
		}
		db.run("INSERT INTO fleets VALUES (?,?,?,?,?)", 
			[info.key, info.fleetid, info.authToken, info.refreshToken, 0], //TODO: time
			function(insertErr){
				if(insertErr){
					callback(insertErr)
				}
				callback(null, info.key)
			}
		)
	},
	checkStateEntryExists: function checkStateEntryExists(state, callback){
		db.get('SELECT * FROM setup WHERE state=?',[state], function(dbErr, row){
			if(!row || dbErr){
				callback(dbErr);
			}
			callback(null, row.fleetid);
		})
	},
	createSetupStateEntry: function createSetupStateEntry(fleetid, callback){
		var state = sha1(config.CREST.APP_ID + fleetid);
		var date = new Date();
		db.run('INSERT INTO setup (state, fleetid, created) VALUES (?,?,?)',
		 [state, fleetid, date.getUTCMilliseconds()],
		 function(insertError){
		 	/*if(insertError){
		 		console.error("Failed to create setup egg", insertError);
		 		// res.status(BAD_DEVELOPER).send("Please report to developer");
		 		callback(insertError, state);
		 	}
		 	callback(null, state);*/
		 	callback(insertError, state);
		 });
	}
}