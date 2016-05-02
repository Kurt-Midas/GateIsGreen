// var https = require('https');
var request = require('request');
// var bodyParser = require('body-parser');

/**
 * Handles calling remote APIs. 
 * @param  {http.Options}   options  [The call to make]
 * @param  {Function} callback [Takes a single arg, either NULL or the JSONified result]
 * @return {[type]}            [void]
 */
module.exports = {
	/**
	 * Calls a remote API 
	 * @param  {[type]}   options  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	remoteGet : function(options, callback){
		console.log("calling remote api with options:", options);
		request.get(options, function(err, response, body){
			if(!err || response.statusCode == 200){
				var bodyObj = JSON.parse(body);
				console.log("Successfully called remote api:", bodyObj)
				callback(null, bodyObj);
			} else {
				console.error("Failed to call remote api with error:", err);
				callback(err);
			}
		})
	},
	//THIS ANGERS KURT
	remotePost : function(options, callback){
		console.log("Calling remote api with options:", options);
		request.post(options, function(err, response, body){
			if(!err || response.statusCode == 200){
				var bodyObj = JSON.parse(body);
				console.log("Successfully called remote api:", bodyObj)
				callback(null, bodyObj);
			} else {
				console.error("Failed to call remote api with error:", err);
				callback(err);
			}
		})
	}


	/*var request = https.request(options, function(result){
		var output = '';
		result.on('data', function(chunk){
			output += chunk;
		});
		result.on('end', function(){
			var obj = JSON.parse(output);
//			console.log(obj); 
			callback(null, obj);
		});
	}).on('error', function(error){
		console.error("Failed call with error", error);
		callback(error);
	}).end();*/
}