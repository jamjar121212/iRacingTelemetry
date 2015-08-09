var SERVER = "http://localhost:8080/"

var iRacingTelemetry = function() {
	this.RequestRepeatRate = 100;
	this.Server = "http://localhost";
	this.Port = 8080;
	this.currentTelemetryData = undefined;
	this.OnUpdate = undefined;
};

iRacingTelemetry.prototype.SetRequestRepeatRate = function(requestRepeatRate) {
	this.RequestRepeatRate = requestRepeatRate;
};

iRacingTelemetry.prototype.SetServer = function(server) {
	this.Server = server;
};

iRacingTelemetry.prototype.SetPort = function(port) {
	this.Port = port;
};

iRacingTelemetry.prototype.RegisterUpdateCallback = function(callback) {
	this.OnUpdate = callback;
};

iRacingTelemetry.prototype.requestData = function() {
	var url = this.Server + ":" + this.Port.toString();

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", encodeURI(url));

	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			this.onDataRetrieved(xmlhttp.responseText);
		}
	}.bind(this);

	xmlhttp.send();
};

iRacingTelemetry.prototype.onDataRetrieved = function(data) {
	var jsonData = JSON.parse(data);
	this.currentTelemetryData = jsonData;
	if (this.OnUpdate) {
		this.OnUpdate(this.currentTelemetryData);
	}
	setTimeout(this.requestData.bind(this), this.RequestRepeatRate);
};

iRacingTelemetry.prototype.Start = function(data) {
	this.requestData();
};


// if the module has no dependencies, the above pattern can be simplified to
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


// var onNewData = function(data) {
// 	console.log(data);
// };

// var telem = new iRacingTelemetry();

// telem.SetRequestRepeatRate(1000/20);
// telem.RegisterUpdateCallback(onNewData);
// telem.Start();
