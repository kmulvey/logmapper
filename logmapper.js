var express = require('express'), now = require("now"), fs = require('fs');
var geoip = require('geoip');
var City = geoip.City;
var city = new City('./GeoLiteCity.dat');
var logfile = "./log";
var backlog_size = 2000;
var stat = null;
var watch = null;
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

// on socket connect
now.on('connect', function() {
	fileWatcher();
});

function fileWatcher(){
	// Stat initial blocks of file
	if(stat == null){
		console.log('stat created');
		stat = fs.stat(logfile, function(err, stats) {
			if (err)
				throw err;
			var start = (stats.size > backlog_size) ? (stats.size - backlog_size) : 0;
			var stream = fs.createReadStream(logfile, {
				start : start,
				end : stats.size
			});
			stream.addListener("data", function(lines) {
				everyone.now.receiveMessage(formatter(lines));
			});
		});
	}
	// file watcher
	if(watch == null){
		console.log('watcher created');
		watch = fs.watchFile(logfile, function(curr, prev) {
			if (prev.size > curr.size)
				return {
					clear : true
				};
			var stream = fs.createReadStream(logfile, {
				start : prev.size,
				end : curr.size
			});
			stream.addListener("data", function(lines) {
				everyone.now.receiveMessage(formatter(lines));
			});
		});
	}
}

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
	return ips;
}
app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);