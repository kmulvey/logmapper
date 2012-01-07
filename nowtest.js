var app = require('express').createServer().listen(80), now = require("now"), fs = require('fs');
var geoip = require('geoip');
var City = geoip.City;
var city = new City('./GeoLiteCity.dat');
var everyone = now.initialize(app);
var filename = "./log";
var backlog_size = 2000;

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
	console.log('conntected from ' + req.connection.remoteAddress);
});

// on socket connect
now.on('connect', function() {
	fs.stat(filename, function(err, stats) {
		if (err)
			throw err;
		var start = (stats.size > backlog_size) ? (stats.size - backlog_size) : 0;
		var stream = fs.createReadStream(filename, {
			start : start,
			end : stats.size
		});
		stream.addListener("data", function(lines) {
			everyone.now.receiveMessage(formatter(lines));
		});
	});

	// file watcher
	fs.watchFile(filename, function(curr, prev) {
		if (prev.size > curr.size)
			return {
				clear : true
			};
		var stream = fs.createReadStream(filename, {
			start : prev.size,
			end : curr.size
		});
		stream.addListener("data", function(lines) {
			everyone.now.receiveMessage(formatter(lines));
		});
	});
});

// pull out the ips
function formatter(arr) {
	arr = arr.toString('utf-8');
	arr = arr.split("\n");
	// arr = arr.slice(arr.indexOf("\n") + 1).split("\n");
	var pattern = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
	var ips = new Array();
	for ( var i in arr) {
		var addr = arr[i].match(pattern);
		if (addr != null) {
			var city_obj = city.lookupSync(addr);
			if (city_obj != null)
				ips.push(city_obj['latitude'].toString().substring(0, 8) + ', '
						+ city_obj['longitude'].toString().substring(0, 8));
		}
	}
	return ips;
}