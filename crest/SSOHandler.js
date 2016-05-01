/*
	1.	Receive a request from the user. Some parts of the request are saved in an in-memory sqlite3 database (known format). 
		fleetid, auth_token, refresh_token, index(sha1())
		Endpoint responds with res.redirect(301, '#CREST_LOGIN' + args and stuff + localhost:#PORT' + req.path and stuff)
			state is the nosql id
	2.	AngularJS has a route to catch the response from the SSO
		Turns state into nosql call
		nosql contains {fleetid, auth_token, refresh_token}
 */

var express = require('express');
var router = express.Router();
var app = express();
var config = require('config');
var sha1 = require('sha1');
var bodyParser = require('body-parser');
var request = require('request');
var url = require('url');

router.use(bodyParser.json());

const REDIRECT = 301;
const BAD_DEVELOPER = 500;

var sqlite3 = require('sqlite3').verbose();
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





router.post('/createFleet', function(req, res){
	if(!req.body.fleetid){
		res.status(MISSING_DATA).send("Missing required field:fleetid");
	}
	var state = sha1(config.CREST.APP_ID + req.body.fleetid);
	var date = new Date();
	db.run('INSERT INTO setup (state, fleetid, created) VALUES (?,?,?)',
	 [state, req.body.fleetid, date.getUTCMilliseconds()],
	 function(insertError){
	 	if(insertError){
	 		console.error("Failed to create egg", insertError);
	 		res.status(BAD_DEVELOPER).send("Please report to developer");
	 	}
	 });
	var ssoLink = config.CREST.SSO_URL
		+ "/?response_type=code"
		+ "&redirect_uri=http://localhost:3000/setup/initialize" //TODO: config this shit
		+ "&client_id=" + config.CREST.APP_ID
		+ "&scope=fleetWrite+fleetRead" //TODO: exact wording of fleet_write and fleet_read
		+ "&state="+state;
	console.log("ssoLink:",ssoLink);
	res.status(200).send({"redirect":ssoLink});
});



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
	request.post(postOptions, function(err, response, body){
		if(!err && response.statusCode == 200){
			var bodyObj = JSON.parse(body);
			console.log("No Error, JSON parsed:", bodyObj);
			callback(null, bodyObj.access_token, bodyObj.refresh_token);
		} else {
			console.log("Call failed with error", err);
			callback(err);
		}
	})
}

function createFleetDBEntry(info, callback){ //info has key, fleetid authToken, refreshToken
	if(!info || !info.authToken || !info.refreshToken || !info.key || !info.fleetid){
		callback("YOU USED THIS WRONG");
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
}

function checkStateEntryExists(state, callback){
	db.get('SELECT * FROM setup WHERE state=?',[state], function(dbErr, row){
		if(!row || dbErr){
			callback(dbErr);
		}
		callback(null, row.fleetid);
	})
}

router.get('/initialize', function(req, res){
	console.log("Got callback from SSO to 'request' package method:");
	console.log("Query:", req.query);
	console.log("Headers:", req.headers);
	console.log("Params:", req.params);
	var state = req.query.state;

	checkStateEntryExists(state, function(stateErr, fleetid){
		if(stateErr){
			console.log("State Error:", stateErr);
			res.status(500).send("State Error");
		}
		exchangeAuthToken(req.query.code, function(authErr, authToken, refreshToken){
			if(authErr){
				console.log("Auth Error:", authErr);
				res.status(500).send("Auth Error");
			}
			var info = {
				"key": sha1(state + fleetid),
				"fleetid": fleetid,
				"authToken": authToken,
				"refreshToken": refreshToken
			}
			console.log(info);
			createFleetDBEntry(info, function(persistErr, dbKey){
				if(persistErr){
					console.log("Persist Error:", persistErr);
					res.status(500).send("Persist Error");
				}
				res.status(200).send(dbKey);
			})
		})
	})
})



module.exports = router;