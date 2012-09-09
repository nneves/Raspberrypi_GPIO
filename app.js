// Raspberry Pi GPIO Remote Control WebInterface
// NOTE: Raspberry Pi GPIO access requires sudo 
// $ sudo node app.js 8080
// $ npm start (for testing, will use port 8080)

var flatiron = require('flatiron'),
    path = require('path'),
    ecstatic = require('ecstatic'),
    app = flatiron.app,
    rpi_gpio = require('rpi-gpio'),
    tcpport = 8080,
    flag_use_websockets = false;

// Processing parameters
if(process.argv[2] !== undefined && process.argv[2].trim() !== '') {
    tcpport = process.argv[2];
    console.log("Tcp/ip port parameter defined: "+tcpport);    
}
else {
    console.log("Using default tcp/ip port: "+tcpport);
}
// websockets param
if(process.argv[3] !== undefined && process.argv[3].trim() !== '' && process.argv[3].trim() === 'websockets') {
    flag_use_websockets = true;
    console.log("Use WebSockets protocol!");
}
else {
    console.log("Using default Http REST protocol!");
}

// maps / exports gpio pins
//                                            (gpio_pin_number, gpio_pin_name)
rpi_gpio.setup(7,  rpi_gpio.DIR_OUT, gpioWrite(7,  'GPIO_04', false));
rpi_gpio.setup(11, rpi_gpio.DIR_OUT, gpioWrite(11, 'GPIO_17', false));
rpi_gpio.setup(13, rpi_gpio.DIR_OUT, gpioWrite(13, 'GPIO_21', false));
rpi_gpio.setup(15, rpi_gpio.DIR_OUT, gpioWrite(15, 'GPIO_22', false));
rpi_gpio.setup(16, rpi_gpio.DIR_OUT, gpioWrite(16, 'GPIO_23', false));
rpi_gpio.setup(18, rpi_gpio.DIR_OUT, gpioWrite(18, 'GPIO_24', false));
rpi_gpio.setup(22, rpi_gpio.DIR_OUT, gpioWrite(22, 'GPIO_25', false));

// gpio write function
function gpioWrite(gpionumber, gpioname, value) {
    return function() {
        rpi_gpio.write(gpionumber, value, function(err) {
            if (err) throw err;
            console.log('[CB] Written to pin number '+gpionumber+' ('+gpioname+') value:'+value);
        });        
    };
};

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
    var gpio = cmd;
    //var gpio = cmd.replace(/_/g, " ");
    //gpio = gpio.replace(/--/g, ";");

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
        if(gpio0 === "SET_GPIO_04") {
            gpioWrite(7,  'GPIO_04', true).call();
        }
        else if(gpio0 === "RESET_GPIO_04") {
            gpioWrite(7,  'GPIO_04', false).call();
        }

        if(gpio0 === "SET_GPIO_17") {
            gpioWrite(11, 'GPIO_17', true).call();
        }
        else if(gpio0 === "RESET_GPIO_17") {
            gpioWrite(11, 'GPIO_17', false).call();
        }

        if(gpio0 === "SET_GPIO_21") {
            gpioWrite(13, 'GPIO_21', true).call();
        }
        else if(gpio0 === "RESET_GPIO_21") {
            gpioWrite(13, 'GPIO_21', false).call();
        }

        if(gpio0 === "SET_GPIO_22") {
            gpioWrite(15, 'GPIO_22', true).call();
        }
        else if(gpio0 === "RESET_GPIO_22") {
            gpioWrite(15, 'GPIO_22', false).call();
        }

        if(gpio0 === "SET_GPIO_23") {
            gpioWrite(16, 'GPIO_23', true).call();
        }
        else if(gpio0 === "RESET_GPIO_23") {
            gpioWrite(16, 'GPIO_23', false).call();
        }

        if(gpio0 === "SET_GPIO_24") {
            gpioWrite(18, 'GPIO_24', true).call();
        }
        else if(gpio0 === "RESET_GPIO_24") {
            gpioWrite(18, 'GPIO_24', false).call();
        }

        if(gpio0 === "SET_GPIO_25") {
            gpioWrite(22, 'GPIO_25', true).call();
        }
        else if(gpio0 === "RESET_GPIO_25") {
            gpioWrite(22, 'GPIO_25', false).call();
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

// verify if websockets is active
if(flag_use_websockets === true) {

  var io = require('socket.io').listen(app.server);
  io.sockets.on('connection', function(socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function(data) {
          console.log(data);
      });
      socket.on('gpiodata', function(data) {
          console.log('Received GPIO Data: '+data.wsdata);
            var gpio0=data.wsdata;
            console.log("GPIO="+gpio0);
            if(gpio0 === "SET_GPIO_04") {
                gpioWrite(7,  'GPIO_04', true).call();
            }
            else if(gpio0 === "RESET_GPIO_04") {
                gpioWrite(7,  'GPIO_04', false).call();
            }

            if(gpio0 === "SET_GPIO_17") {
                gpioWrite(11, 'GPIO_17', true).call();
            }
            else if(gpio0 === "RESET_GPIO_17") {
                gpioWrite(11, 'GPIO_17', false).call();
            }

            if(gpio0 === "SET_GPIO_21") {
                gpioWrite(13, 'GPIO_21', true).call();
            }
            else if(gpio0 === "RESET_GPIO_21") {
                gpioWrite(13, 'GPIO_21', false).call();
            }

            if(gpio0 === "SET_GPIO_22") {
                gpioWrite(15, 'GPIO_22', true).call();
            }
            else if(gpio0 === "RESET_GPIO_22") {
                gpioWrite(15, 'GPIO_22', false).call();
            }

            if(gpio0 === "SET_GPIO_23") {
                gpioWrite(16, 'GPIO_23', true).call();
            }
            else if(gpio0 === "RESET_GPIO_23") {
                gpioWrite(16, 'GPIO_23', false).call();
            }

            if(gpio0 === "SET_GPIO_24") {
                gpioWrite(18, 'GPIO_24', true).call();
            }
            else if(gpio0 === "RESET_GPIO_24") {
                gpioWrite(18, 'GPIO_24', false).call();
            }

            if(gpio0 === "SET_GPIO_25") {
                gpioWrite(22, 'GPIO_25', true).call();
            }
            else if(gpio0 === "RESET_GPIO_25") {
                gpioWrite(22, 'GPIO_25', false).call();
            }
      });
  });
}

// CTRL+C (sigint)
process.on( 'SIGINT', function() {
  console.log("Unexport GPIO!");
  gpioClose();
  
  console.log( "Gracefully shutting down from  SIGINT (Crtl-C)");
  process.exit( )
});