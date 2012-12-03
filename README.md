# Logmapper  [![Build Status](https://secure.travis-ci.org/kmulvey/logmapper.png?branch=master)](https://travis-ci.org/kmulvey/logmapper)

Plot your visitors locations in real time
---

### Required node modules:

express:

	npm install [-g] express

geoip:

	npm install geoip [-g]

now:

	npm install now [-g]

### Required changes
	
Download GeoIP data file (GeoLiteCity.dat):
	[Maxmind](http://www.maxmind.com/app/geolitecity)

Logfile path:	

	var logfile is the path to your log file

Enter Google Maps API key: edit the script src in the html file to have your api key

### License

	LogMapper is open sourced under the Apache License version 2.0.
	http://www.apache.org/licenses/LICENSE-2.0.html
	
### TODO

	rewrite frontend in Jade/Less
	
