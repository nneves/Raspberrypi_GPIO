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