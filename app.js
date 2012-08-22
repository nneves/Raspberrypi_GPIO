// Raspberry Pi GPIO Remote Control WebInterface
// NOTE: Raspberry Pi GPIO access requires sudo 
// $ sudo node app.js 8080
// $ npm start (for testing, will use port 8080)

var flatiron = require('flatiron'),
    path = require('path'),
    ecstatic = require('ecstatic'),
    app = flatiron.app,
    rpi_gpio = require('rpi-gpio'),
    tcpport = 8080;

// Processing parameters
if(process.argv[2] !== undefined && process.argv[2].trim() !== '') {
    tcpport = process.argv[2];
    console.log("Tcp/ip port parameter defined: "+tcpport);    
}
else {
    console.log("Using default tcp/ip port: "+tcpport);
}

// maps / exports gpio pins
rpi_gpio.setup(7, rpi_gpio.DIR_OUT, gpioWrite4);
rpi_gpio.setup(11, rpi_gpio.DIR_OUT, gpioWrite17);
rpi_gpio.setup(13, rpi_gpio.DIR_OUT, gpioWrite21);
rpi_gpio.setup(15, rpi_gpio.DIR_OUT, gpioWrite22);
rpi_gpio.setup(16, rpi_gpio.DIR_OUT, gpioWrite23);
rpi_gpio.setup(18, rpi_gpio.DIR_OUT, gpioWrite24);
rpi_gpio.setup(22, rpi_gpio.DIR_OUT, gpioWrite25);

// gpio write function
function gpioWrite4(value) {
    rpi_gpio.write(7, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 7 (GPIO4) value:'+value);
    });
}
function gpioWrite17(value) {
    rpi_gpio.write(11, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 11 (GPIO17) value:'+value);
    });
}
function gpioWrite21(value) {
    rpi_gpio.write(13, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 13 (GPIO21) value:'+value);
    });
}
function gpioWrite22(value) {
    rpi_gpio.write(15, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 15 (GPIO22) value:'+value);
    });
}
function gpioWrite23(value) {
    rpi_gpio.write(16, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 16 (GPIO23) value:'+value);
    });
}
function gpioWrite24(value) {
    rpi_gpio.write(18, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 18 (GPIO24) value:'+value);
    });
}
function gpioWrite25(value) {
    rpi_gpio.write(22, value, function(err) {
        if (err) throw err;
        console.log('Written to pin 22 (GPIO25) value:'+value);
    });
}

// gpio unexport
function gpioClose() {
    rpi_gpio.destroy(function() {
        console.log('All pins unexported');
        return process.exit(0);
    });
}


// flatiron configurations
app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

// flatiron plugins
app.use(flatiron.plugins.http);

// flatiron - ecstatic (server resources from directory - html, css, js, images)
app.http.before = [
  ecstatic(__dirname + '/public')
];

//app.router.configure({ "strict": false });

// flatiron router - API for GCODE commands
app.router.get('/gpio/:cmd', function (cmd) {

	console.log('\r\nParsing REST gpio command: '+cmd);

	// decode SPACE and ; chars (previously encoded in client)
	var gpio = cmd.replace(/_/g, " ");
	gpio = gpio.replace(/--/g, ";");

	console.log('Decoded gpio command: '+gpio);

    // check if it contains a multiple gpio commands (will use ; as separator)
    if(gpio.indexOf(";") != -1) {

        var gpio_array=gpio.split(";");
        var gpio_cmd;

        for(var i=0, len=gpio_array.length; i<len; i++) {
            gpio_cmd=unescape(gpio_array[i].replace(/\+/g, " ")); // url decode
            console.log("GPIO"+i.toString()+"="+gpio_cmd);
            //sp.write(gpio_cmd+"\r\n");
        }
    }
    else {
        var gpio0=gpio;
        gpio0=unescape(gpio0.replace(/\+/g, " ")); // url decode
        console.log("GPIO="+gpio0);
        if(gpio0 === "SET_GPIO_04")
        {
            gpioWrite4(true);
            console.log("GPIO4_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_04")
        {
            gpioWrite4(false);
            console.log("GPIO4_VALUE: false");
        }

        if(gpio0 === "SET_GPIO_17")
        {
            gpioWrite17(true);
            console.log("GPI17_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_17")
        {
            gpioWrite17(false);
            console.log("GPI17_VALUE: false");
        }

        if(gpio0 === "SET_GPIO_21")
        {
            gpioWrite21(true);
            console.log("GPI21_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_21")
        {
            gpioWrite21(false);
            console.log("GPI21_VALUE: false");
        }

        if(gpio0 === "SET_GPIO_22")
        {
            gpioWrite22(true);
            console.log("GPI22_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_22")
        {
            gpioWrite22(false);
            console.log("GPI22_VALUE: false");
        }

        if(gpio0 === "SET_GPIO_23")
        {
            gpioWrite23(true);
            console.log("GPI23_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_23")
        {
            gpioWrite23(false);
            console.log("GPI23_VALUE: false");
        }

        if(gpio0 === "SET_GPIO_24")
        {
            gpioWrite24(true);
            console.log("GPI24_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_24")
        {
            gpioWrite24(false);
            console.log("GPI24_VALUE: false");
        }

        if(gpio0 === "SET_GPIO_25")
        {
            gpioWrite25(true);
            console.log("GPI25_VALUE: true");
        }
        else if(gpio0 === "RESET_GPIO_25")
        {
            gpioWrite25(false);
            console.log("GPI25_VALUE: false");
        }            
    }        

    // responding back to the brower request
    this.res.writeHead(200, {'Content-Type':'text/plain'});
    this.res.write('ACK');
    this.res.end();
});

// launch app on tcpoprt
app.start(tcpport);
console.log('Raspberry Pi GPIO WebInterface Server running on port '+tcpport);

// CTRL+C (sigint)
process.on( 'SIGINT', function() {
  console.log("Unexport GPIO!");
  gpioClose();
  
  console.log( "Gracefully shutting down from  SIGINT (Crtl-C)");
  process.exit( )
});
