var iRacingTelemetry = function() {
	this._server = "http://localhost";
	this._port = 8080;

	this._currentTelemetryData = undefined;
	this._currentSessionInfoData = undefined;

	this._onUpdateTelemetry = undefined;
	this._onUpdateSessionInfo = undefined;

	this._telemetryRequestTimeout = undefined;
	this._sessionInfoRequestTimeout = undefined;

	this._running = false;

	this._dataRetrievedCallbacks = {
		iRacingTelemetry.TELEMETRY_QUERY: this._onTelemetryDataRetrieved.bind(this),
		iRacingTelemetry.SESSION_INFO_QUERY: this._onSessionInfoDataRetrieved.bind(this)
	};

	this._requestRepeatRate = {
		iRacingTelemetry.TELEMETRY_QUERY: 200,
		iRacingTelemetry.SESSION_INFO_QUERY: 1000
	};
};

iRacingTelemetry.TELEMETRY_QUERY = "?type=telemetry";
iRacingTelemetry.SESSION_INFO_QUERY = "?type=sessioninfo";

// set the rate at which we poll for telemetry data in milliseconds
iRacingTelemetry.prototype.setTelemetryRequestRepeatRate = function(telemetryRequestRepeatRate) {
	this._requestRepeatRate.TELEMETRY_QUERY = telemetryRequestRepeatRate;
};

// set the rate at which we poll for session info data in milliseconds
iRacingTelemetry.prototype.setSessionInfoRequestRepeatRate = function(sessionInfoRequestRepeatRate) {
	this._requestRepeatRate..SESSION_INFO_QUERY = sessionInfoRequestRepeatRate;
};

// set the url of the telemetry server
iRacingTelemetry.prototype.setServer = function(server) {
	this._server = server;
};

// set the port number of the telemetry server
iRacingTelemetry.prototype.setPort = function(port) {
	this._port = port;
};

// register a callback function to be called whenever new telemetry data has been received
iRacingTelemetry.prototype.registerUpdateTelemetryCallback = function(callback) {
	this._onUpdateTelemetry = callback;
};

// register a callback function to be called whenever new session info data has been received
iRacingTelemetry.prototype.registerUpdateSessionInfoCallback = function(callback) {
	this._onUpdateSessionInfo = callback;
};

// begin polling for telemetry data
iRacingTelemetry.prototype.start = function(data) {
	this._running = true;
	this._requestData(iRacingTelemetry.TELEMETRY_QUERY);
	this._requestData(iRacingTelemetry.SESSION_INFO_QUERY);
};

// stop polling for telemetry data
iRacingTelemetry.prototype.stop = function(data) {
	this._running = false;
	if (this._telemetryRequestTimeout) {
		clearTimeout(this._telemetryRequestTimeout);
	}
	if (this._sessionInfoRequestTimeout) {
		clearTimeout(this._sessionInfoRequestTimeout);
	}
};

iRacingTelemetry.prototype._requestData = function(query) {
	var url = this._server + ":" + this._port.toString() + query;

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", encodeURI(url));

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			this._dataRetrievedCallbacks[query](xmlhttp.responseText);
		} else {
			console.log(query + " - Request failed, trying again...");
			setTimeout(this._requestData.bind(this, queryType), this._requestRepeatRate[queryType]);
		}
	}.bind(this);

	xmlhttp.send();
};

iRacingTelemetry.prototype._onTelemetryDataRetrieved = function(data) {
	var jsonData = JSON.parse(data);
	this._currentTelemetryData = jsonData;
	if (this._onUpdateTelemetry) {
		this._onUpdateTelemetry(this._currentTelemetryData);
	}
	if (this._running) {
		var queryType = iRacingTelemetry.SESSION_INFO_QUERY;
		this._telemetryRequestTimeout = setTimeout(this._requestData.bind(this, queryType), this._requestRepeatRate[queryType]);
	}
};

iRacingTelemetry.prototype._onSessionInfoDataRetrieved = function(data) {
	var jsonData = JSON.parse(data);
	this._currentSessionInfoData = jsonData;
	if (this._onUpdateSessionInfo) {
		this._onUpdateSessionInfo(this._currentTelemetryData);
	}
	if (this._running) {
		var queryType = iRacingTelemetry.SESSION_INFO_QUERY;
		this._sessionInfoRequestTimeout = setTimeout(this._requestData.bind(this, queryType), this._requestRepeatRate[queryType]);
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