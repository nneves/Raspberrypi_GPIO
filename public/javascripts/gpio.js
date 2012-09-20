/* DEMO CODE
var myobj = new RPI.Gpio(); // explicit contructor call
or
var myobj = RPI.Gpio();

	<!-- Demo code to be used in the main HTML file -->
	<script type="text/javascript" src="javascripts/gpio.js"></script>
	<script type="text/javascript">
		var rpi_gpio = RPI.Gpio();
	</script>
*/
//-----------------------------------------------------------------------------
var RPI = {};
//-----------------------------------------------------------------------------
RPI.Gpio = function () {
	//var rpi_gpio = RPI.Gpio();	
	if(!(this instanceof arguments.callee)) {
		console.log("Auto create and return object!");
		return new arguments.callee();
	}	
	console.log("Creating RPI.Gpio object.");

  	this.gpio_cache = {
    	"GPIO_04": false,
    	"GPIO_17": false,
    	"GPIO_21": false,
    	"GPIO_22": false,
    	"GPIO_23": false,
    	"GPIO_24": false,
    	"GPIO_25": false
  	};

  	this.getGpioStatus();	
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Public - RPI namespace Scope
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype.sendCmd = function (cmd) {

	// internal ajax request object
	var sendReq = this._getXmlHttpRequestObject();	

	var url_cmd = '/gpio/'+cmd;

	if (sendReq.readyState == 4 || sendReq.readyState == 0) {
		sendReq.open("GET",url_cmd,true);
        sendReq.setRequestHeader('Accept','application/json');
        sendReq.setRequestHeader('Content-Type','text/xml');
		sendReq.onreadystatechange = this._sendCmdCB(url_cmd);
        console.log("-> AJAX cmd: "+cmd);
		sendReq.send(null);
	}	
};
//-----------------------------------------------------------------------------
RPI.Gpio.prototype.getGpioStatus = function () {

	// internal ajax request object
	var sendReq = this._getXmlHttpRequestObject();	

	var url_cmd = '/gpiostatus/';

	if (sendReq.readyState == 4 || sendReq.readyState == 0) {
		sendReq.open("GET",url_cmd,true);
        sendReq.setRequestHeader('Accept','application/json');
        sendReq.setRequestHeader('Content-Type','text/xml');
		sendReq.onreadystatechange = this._getGpioStatus(url_cmd);
        console.log("-> AJAX gpiostatus");
		sendReq.send(null);
	}	
};
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype.ui_control = function (that) { 
    var gpio_id = that.id;
    var gpio_pre_cmd = "";

    this.gpio_cache[gpio_id] = !this.gpio_cache[gpio_id];
    console.log(gpio_id +' = '+this.gpio_cache[gpio_id]);

    if(this.gpio_cache[gpio_id] === true) {
      that.className = "on";
      gpio_pre_cmd = "SET_";
    }
    else {
      that.className = "off";
      gpio_pre_cmd = "RESET_";
    }

    // send AJAX REST request to Raspberrypi_GPIO node app (SET_GPIO_04)
    this.sendCmd(gpio_pre_cmd+gpio_id);
};
//-----------------------------------------------------------------------------	

//-----------------------------------------------------------------------------
// Private - RPI namespace Scope
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype._getXmlHttpRequestObject = function () {

	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} else if(window.ActiveXObject) {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		alert(
		'Status: Could not create XmlHttpRequest Object.' +
		'Consider upgrading your browser.');
	}
};
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype._sendCmdCB = function (url) {
	return function() {
		if (this.readyState == 4 || this.readyState == 0) {
			console.log('<- AJAX cmd['+url+'] = '+this.responseText);
		}
	};
};
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype._getGpioStatus = function (url) {
	return function() {
		if (this.readyState == 4 || this.readyState == 0) {
			console.log('<- AJAX cmd['+url+'] = '+this.responseText);
			this.gpio_cache = JSON.parse(this.responseText);
		}
	};
};
//-----------------------------------------------------------------------------	