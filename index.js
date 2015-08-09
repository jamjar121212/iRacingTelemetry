var SERVER = "http://localhost:8080/"

var iRacingTelemetry = function() {
	this._requestRepeatRate = 100;
	this._server = "http://localhost";
	this._port = 8080;
	this._currentTelemetryData = undefined;
	this._onUpdate = undefined;
	this._requestTimeout = undefined;
	this._running = false;
};

// set the rate at which we poll for telemetry data in milliseconds
iRacingTelemetry.prototype.SetRequestRepeatRate = function(requestRepeatRate) {
	this._requestRepeatRate = requestRepeatRate;
};

// set the url of the telemetry server
iRacingTelemetry.prototype.SetServer = function(server) {
	this._server = server;
};

// set the port number of the telemetry server
iRacingTelemetry.prototype.SetPort = function(port) {
	this._port = port;
};

// register a callback function to be called whenever new telemetry data has been received
iRacingTelemetry.prototype.RegisterUpdateCallback = function(callback) {
	this._onUpdate = callback;
};

// begin polling for telemetry data
iRacingTelemetry.prototype.Start = function(data) {
	this._running = true;
	this._requestData();
};

// stop polling for telemetry data
iRacingTelemetry.prototype.Stop = function(data) {
	this._running = false;
	if (this._requestTimeout) {
		clearTimeout(this._requestTimeout);
	}
	this._requestData();
};

iRacingTelemetry.prototype._requestData = function() {
	var url = this._server + ":" + this._port.toString();

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", encodeURI(url));

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			this._onDataRetrieved(xmlhttp.responseText);
		}
	}.bind(this);

	xmlhttp.send();
};

iRacingTelemetry.prototype._onDataRetrieved = function(data) {
	var jsonData = JSON.parse(data);
	this._currentTelemetryData = jsonData;
	if (this._onUpdate) {
		this._onUpdate(this._currentTelemetryData);
	}
	if (this._running) {
		this._requestTimeout = setTimeout(this._requestData.bind(this), this._requestRepeatRate);
	}
};


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
    return iRacingTelemetry;
}));