var express 		= require('express');
var port 			= 3000;
var logger 			= require('morgan');
var server 			= express();

server.use(express.static(__dirname + '/public'));

var infoGenerator = require('./src/InfoGenerator.js');

var memberCalls = require('./crest/Members.js');

var tempFleetId = 1088411226705

var ssoHandler = require('./crest/SSOHandler');
server.use('/setup', ssoHandler);

function runServerCallback(){
	if(infoGenerator.info){
		console.log("Successful infoGenerator inside runServerCallback")
	} else {
		console.error("InfoGenerator unsuccessfully initialized inside runServerCallback")
	}
	server.listen(port, function(){
		console.log('Server listening on port ' + port);
	})
}
//loggers
//bodyParsers
//mongoose

//routes
console.log("Initializing infoGenerator");
infoGenerator.initialize(runServerCallback);
// infoGenerator.info;

// var router = express.Router();
const GOOD = 200;

server.get('/info/ships', function(req, res){
	res.status(GOOD).json(infoGenerator.info.shipDetails)
})
server.get('/info/systems', function(req, res){
	res.status(GOOD).json(infoGenerator.info.locations)
})