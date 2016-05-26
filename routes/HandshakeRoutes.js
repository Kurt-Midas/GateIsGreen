/*
	handshakeInit		//create fleet egg. Returns URL of SSO page
	handshakeConfirm 	//initialize, create fleet session. Redirect to '/fleet/#fleetid' or '/handshakeError'
 */

var express 	= require('express');
var router 		= express.Router();
var bodyParser 	= require('body-parser');
router.use(bodyParser.json());

// var ssoHandler 	= require('../crest/SSOHandler');
var handshakeHandler = require('../crest/HandshakeHandler');


const REDIRECT = 301;
const BAD_DEVELOPER = 500;
const OKAY = 200;

/**
 * Creates a session egg from a numeric fleetid. Returns an external URL. UI must handle redirection.
 * @param  {[type]} req                       [needs 'body.fleetid']
 * @param  {[type]} res
 */
router.post('/beginHandshake', function(req, res){
	console.log("HandshakeRoutes :: beginHandshake route");
	if(!req.body.fleetid){
		res.status(403).send("Missing required field:fleetid"); //TODO: fix
		//TODO: verify numeric. This is put into API calls, highly unsafe
	}
	handshakeHandler.beginHandshake(req.body.fleetid, function(err, response){
		if(err){
			console.log("HandshakeRoutes.createFleet :: Got error in handshakeHandler.beginHandshake:", err);
			res.status(BAD_DEVELOPER).send("Failed to create session egg. This is bad, please contact the dev");
		}
		res.status(OKAY).send({"redirect": response});
	})
});

router.get('/completeHandshake', function(req, res){
	console.log("HandshakeRoutes :: completeHandshake route");
	if(!req.query.state || !req.query.code){
		res.status(BAD_DEVELOPER).send("Please let me know if you successfully crash the site");
	}
	handshakeHandler.completeHandshake(req.query.state, req.query.code, function(err, response){
		if(err){
			res.status(BAD_DEVELOPER).send(err); //make sure this is safe
		}
		// res.status(OKAY).send(response); //??
		// res.status(301).send('#/fleets/' + response);
		res.redirect(301, '/#/fleets/' + response);
	})
})


module.exports = router;