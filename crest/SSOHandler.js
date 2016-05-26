var config = require('config');
var url = require('url');
var utils = require('../src/Utils')

function useToken(token, type, callback){
	var urlObj = {
		protocol: 'https',
		host: 'login-tq.eveonline.com',
		pathname: '/oauth/token'
	}
	var concat = config.CREST.APP_ID + ":" + config.CREST.APP_KEY;
	var tokenAuthHeaderString = "Basic " + new Buffer(concat, 'utf8').toString('base64');
	var postOptions = {};
	postOptions.url = url.format(urlObj);
	postOptions.headers = 	{"Authorization": tokenAuthHeaderString};
	if(type == "auth"){
		postOptions.form = {
			grant_type: "authorization_code",
			code: token
		}
	} else if(type = "refresh"){
		postOptions.form = {
			grant_type: "refresh_token",
			refresh_token: token
		}
	} else {
		callback("The only supported types are 'auth' and 'refresh'");
		return;
	}
	utils.remotePost(postOptions, function(postErr, bodyObj){
		if(postErr){
			console.error("Call failed with error:", postErr);
			callback(postErr);
			return;
		}
		console.log("SSOHandler :: useToken, got access token from", type, "type with response", bodyObj);
		callback(null, bodyObj.access_token, bodyObj.refresh_token);
	})
}

module.exports = {
	exchangeAuthToken : function(authToken, callback){
		useToken(authToken, "auth", callback);
	},
	exchangeRefreshToken : function(refreshToken, callback){
		useToken(refreshToken, "refresh", callback);
	}
}