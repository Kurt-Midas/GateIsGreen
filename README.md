# GateIsGreen
Fleet Management

#About Me
Everyone has a different way of playing Eve. This is mine. 

Beyond this I'm just a random boring PvE scrub. 

#Feature Requests
Use the "Issues" tab above to help with requests/ideas/suggestions. 

I'm not a pro/godly/legendary (or competent) FC, so don't expect I'm working on your ideas even if they seem obvious.

#Setup
This is supposed to be easy to set up. That said, please help. 

1.	Go to the CCP 3rd Party Development site and create a 3rd party app. Call it whatever you want and set the callback URL to "http://$SERVER:$PORT/handshake/beginHandshake/". For development and testing on a local build, use "localhost" as the server and "3000" as the port. 
2.	Go to the "config/default.json" file and set APP_ID and APP_KEY to your app's values.
3.	Go to Fuzzworks SDE and download "sqlite-latest.sqlite" to the same directory as index.js
4.	Install Node. 
5.	Bower should be globally installed
6.	Run index.js however you want. For example
	$> node index.js
	$> nodemon index.js
7.	Tell me if it explodes

The app has no dependencies on external DB connections. DB setups are in-memory only. This may be configurable in the future. 
