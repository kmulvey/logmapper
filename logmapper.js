var express = require('express'), now = require("now"), fs = require('fs'), util = require('util');
var geoip = require('geoip');
var City = geoip.City;
var city = new City('./GeoLiteCity.dat');
var logfile;
if (process.argv[2] != undefined){
	logfile = process.argv[2];
	if (!path.existsSync(filename)){
		throw(filename + ' does not exists');
	}
}
else {
	logfile = "./log";
}
var backlog_size = 2000;
var app = module.exports = express.createServer();
var everyone = now.initialize(app);

// Express Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// send html page back
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
	console.log('conntected from ' + req.connection.remoteAddress);
});

// file watcher
fs.watchFile(logfile, function(curr, prev) {
	if (prev.size > curr.size)
		return {
			clear : true
		};
	fs.createReadStream(logfile, {
		start : prev.size,
		end : curr.size
	}).addListener("data", function(lines) {
		formatter(lines);
	});
});


// pull out the ips
function formatter(arr) {
	arr = arr.toString('utf-8');
	arr = arr.split("\n");
	// arr = arr.slice(arr.indexOf("\n") + 1).split("\n");
	var pattern = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
	var ips = new Array();
	for ( var i in arr) {
		var addr = arr[i].match(pattern);
		if (addr != null) {
			var city_obj = city.lookupSync(addr);
			if (city_obj != null)
				ips.push(city_obj['latitude'].toString().substring(0, 8) + ', ' + city_obj['longitude'].toString().substring(0, 8));
		}
	}
	if(everyone.now.receiveMessage != null)
		everyone.now.receiveMessage(ips);
}
app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

setInterval(function(){ console.log(util.inspect(process.memoryUsage()));},5000);