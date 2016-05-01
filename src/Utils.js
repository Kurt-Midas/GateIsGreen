var https = require('https');
// var bodyParser = require('body-parser');

/**
 * Handles calling remote APIs. 
 * @param  {http.Options}   options  [The call to make]
 * @param  {Function} callback [Takes a single arg, either NULL or the JSONified result]
 * @return {[type]}            [void]
 */
module.exports.remoteApiCaller = function remoteApiCaller(options, callback){
	var request = https.request(options, function(result){
		var output = '';
		result.on('data', function(chunk){
			console.log(chunk);
			output += chunk;
		});
		result.on('end', function(){
			var obj = JSON.parse(output);
			console.log(obj); 
			callback(obj);
		});
	}).on('error', function(error){
		console.error("Failed call with error", error);
		callback(null);
	}).end();
}