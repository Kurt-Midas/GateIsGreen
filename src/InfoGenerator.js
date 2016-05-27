/*
1.	Look for data files (currently sqlite, future YAML)
2.	Turn them into a json object
3.	Keep the json object, free other resources
 */

var info = {};
info.shipDetails = {};
info.locations = {};

module.exports.initialize = function initializeInfo(runServerCallback){
	var sqlite3 = require('sqlite3').verbose();
	new sqlite3.Database('sqlite-latest.sqlite', 
		sqlite3.OPEN_READONLY,
		function(openErr){
			// console.log("Inside db callback:", openErr, " || ");
			if(openErr){
				console.error("Error occurred in open DB,", openErr)
				process.exit(1)
			}
			console.log("sqlite-latest successfully opened");
		}
	).all("SELECT g.groupID, g.groupName, t.typeID, t.typeName "
			+"FROM invgroups g inner join invtypes t "
			+"on g.groupID = t.groupID "
			+"where g.categoryID=6",
		 [], 
		 function(queryErr, rows){
			if(queryErr){
				console.error("Error occurred in ships query,", queryErr);
				process.exit(1);
			}
			// console.log("ships query rows: ", rows)
			var counter = 0;
			for(i=0; i<rows.length; i++){
				counter += 1;
				info.shipDetails[rows[i].typeID] = {
					"shipName":rows[i].typeName,
					"groupID":rows[i].groupID,
					"groupName":rows[i].groupName
				}
			}
			// console.log("shipDetails: ", info.shipDetails)
			console.log("info.shipDetails populated with", counter, "elements");
		}
	).all("SELECT s.solarSystemName, s.solarSystemID, s.security, s.regionID, r.regionName, s.constellationID, c.constellationName "
		+"from mapSolarSystems s "
		+"inner join mapRegions r on s.regionID = r.regionID "
		+"inner join mapConstellations c on s.constellationID = c.constellationID",
		[],
		function(queryErr, rows){
			if(queryErr){
				console.error("Error occurred in map query,", queryErr)
				process.exit(1)
			}
			// console.log("map query rows: ", rows)
			var counter = 0;
			for(i=0; i<rows.length; i++){
				counter += 1;
				info.locations[rows[i].solarSystemID] = {
					"s": rows[i].solarSystemName,
					// "regionID": rows[i].regionID,
					"r": rows[i].regionName,
					// "constellationID": rows[i].constellationID,
					"c": rows[i].constellationName
				}
			}
			console.log("info.locations populated with", counter, "elements");
			// console.log(info.locations)
		}
	).close(function(closeDBErr){
		if(closeDBErr){
			console.error("Failed to close sqlite database");
		}
		runServerCallback();
	});
}

module.exports.info = info;