/*	
	All fleet info (CREST's 30 second cache)
	Basic fleet info (CREST's 5 second cache)
	Member Info
	Fleet Structure Info
	??? etc
 */
var express 	= require('express');
var router 		= express.Router();
var bodyParser 	= require('body-parser');
router.use(bodyParser.json());

var fleetService = require('../crest/FleetInfoCallHandler');

router.get('/getFleetInfo:fleetSessionId', function(req, res){
	if(!req.params.fleetSessionId){
		res.status(500).send("Missing required parameter 'key'")
	}
	var key = req.params.fleetSessionId;
	fleetService.getFleetInfo(key, function(err, fleetDisplay){
		if(err){
			res.status(500).send("error getting fleet info");
		}
		res.status(200).send(fleetDisplay);
	});
});

module.exports = router;