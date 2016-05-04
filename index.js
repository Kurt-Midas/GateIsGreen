var express 		= require('express');
var port 			= 3000;
var logger 			= require('morgan');
var server 			= express();

server.use(express.static(__dirname + '/public'));

var infoGenerator = require('./src/InfoGenerator.js');


var fleetDataRoutes = require('./routes/FleetDataRoutes.js');
server.use('/fleet', fleetDataRoutes);

var handshakeRoutes = require('./routes/HandshakeRoutes');
server.use('/handshake', handshakeRoutes);
// var ssoHandler = require('./crest/SSOHandler');
// server.use('/setup', ssoHandler);
// 
const GOOD = 200;
server.get('/info/ships', function(req, res){
	res.status(GOOD).json(infoGenerator.info.shipDetails);
})
server.get('/info/systems', function(req, res){
	res.status(GOOD).json(infoGenerator.info.locations);
})
server.get('/info', function(req, res){
	res.status(GOOD).json({
		"shipInfo": infoGenerator.info.shipDetails,
		"locationInfo": infoGenerator.info.locations});
})
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

console.log("Initializing infoGenerator");
infoGenerator.initialize(runServerCallback);