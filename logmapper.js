var express = require('express'), now = require("now"), http = require('http'), gf = require('growing-file'), geoip = require('geoip');
var city = new geoip.City('./GeoLiteCity.dat');
var logfile;
if (process.argv[2] != undefined){
	logfile = process.argv[2];
	if (!path.existsSync(filename)){
		throw(filename + ' does not exists');
	}
}
else {
	logfile = "./test.log";
}
var file = gf.open(logfile);
var app = express();
var server = http.createServer(app);
var everyone = now.initialize(app);

//Express Configuration
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
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

//file watcher
file.on('data', function(arr) {
	arr = arr.toString('utf-8');
	arr = arr.split("\n");
	var pattern = /((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})/g;
	var ips = new Array();
	var addr = arr[0].match(pattern);
	if (addr != null) {
		var geo = city.lookupSync(addr.toString('utf-8'));
		if(geo != null){
			ips.push(geo['latitude'].toString().substring(0, 8) + ', ' + geo['longitude'].toString().substring(0, 8));
		}
	}
	if(everyone.now.receiveMessage != null)
		everyone.now.receiveMessage(ips);
});

server.listen(8000);
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
