var rp = require('request-promise');
// var bodyParser = require('body-parser');

module.exports = {
	remoteCall : function(options){
		return rp(options);
	}
}