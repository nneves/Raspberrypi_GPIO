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
RPI.Gpio = function (ui_ctrls) {
	//var rpi_gpio = RPI.Gpio();	
	if(!(this instanceof arguments.callee)) {
		console.log("Auto create and return object!");
		return new arguments.callee(ui_ctrls);
	}	
	console.log("Creating RPI.Gpio object.");

	this.gpio_ctrls = ui_ctrls;
  	this.gpio_cache = {
    	"GPIO_04": false,
    	"GPIO_17": false,
    	"GPIO_21": false,
    	"GPIO_22": false,
    	"GPIO_23": false,
    	"GPIO_24": false,
    	"GPIO_25": false,
    	"WEBSOCKETS": false
  	};

  	this.getGpioStatus();

  	//websocket funcionality
  	var self = this;
  	var timer;
  	if (typeof io !== "undefined") {
	    this.socket = io.connect('http://'+window.location.host);
	    this.socket.on('gpionewstatus', function (data) {
	      console.log('GPIO new status: '+data.newdata);
	      self.update_ui_control(data.newdata);
	    });
	}
	else {
		this.gpio_cache["WEBSOCKETS"] = false;
		this.timer_update_ui_control(this);
	}
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Public - RPI namespace Scope
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype.sendCmd = function (cmd) {

	if (this.gpio_cache["WEBSOCKETS"] === true) {
		console.log("Socket Emit: "+cmd);
		this.socket.emit('gpiodata', { wsdata: cmd });
	}
	else {
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
	}
};
//-----------------------------------------------------------------------------
RPI.Gpio.prototype.getGpioStatus = function () {

	// internal ajax request object
	var sendReq = this._getXmlHttpRequestObject();	

	var url_cmd = '/gpiostatus';

	if (sendReq.readyState == 4 || sendReq.readyState == 0) {
		sendReq.open("GET",url_cmd,true);
        sendReq.setRequestHeader('Accept','application/json');
        sendReq.setRequestHeader('Content-Type','text/xml');
		sendReq.onreadystatechange = this._getGpioStatus(this, url_cmd);
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
RPI.Gpio.prototype.init_ui_control = function (that) { 
    var gpio_id = that.id;

    console.log("Initialize UI ctrl: "+gpio_id +' = '+this.gpio_cache[gpio_id]);

    if(this.gpio_cache[gpio_id] === true) {
      that.className = "on";
    }
    else {
      that.className = "off";
    }
};
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype.init_all_ui_control = function () { 
    this.init_ui_control(this.gpio_ctrls["GPIO_04"]);
    this.init_ui_control(this.gpio_ctrls["GPIO_17"]);
    this.init_ui_control(this.gpio_ctrls["GPIO_21"]);
    this.init_ui_control(this.gpio_ctrls["GPIO_22"]);
    this.init_ui_control(this.gpio_ctrls["GPIO_23"]);
    this.init_ui_control(this.gpio_ctrls["GPIO_24"]);
    this.init_ui_control(this.gpio_ctrls["GPIO_25"]);
};
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype.update_ui_control = function (cmd) { 

	var gpio_id = cmd.replace(/RESET_/g, "");
	gpio_id = gpio_id.replace(/SET_/g, "");
	console.log('Found GPIO_ID: '+gpio_id);

	if(cmd.indexOf("RESET_") != -1)
		this.gpio_cache[gpio_id] = false;
	else if(cmd.indexOf("SET_") != -1)
		this.gpio_cache[gpio_id] = true;

    this.init_ui_control(this.gpio_ctrls[gpio_id]);
};
//-----------------------------------------------------------------------------	
RPI.Gpio.prototype.timer_update_ui_control = function () { 

    var self = this;
    var timer_period = 5;

    console.log('TIMER_TRIGGER');
    this.getGpioStatus();

    setTimeout(function () { 
    	self.timer_update_ui_control(); 
    }, timer_period*1000);
};
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
RPI.Gpio.prototype._getGpioStatus = function (that, url) {
	return function() {
		if (this.readyState == 4 || this.readyState == 0) {
			if (that === undefined || typeof that !== 'object') {
	    		console.log('Invalid caller pointer in function _getGpioStatus!');
	    		return;
	    	}			
			console.log('<- AJAX cmd['+url+'] = '+this.responseText);
			that.gpio_cache = JSON.parse(this.responseText);
			console.log(that.gpio_cache);

			// calls ui initilizations function
			that.init_all_ui_control();
		}
	};
};
//-----------------------------------------------------------------------------	