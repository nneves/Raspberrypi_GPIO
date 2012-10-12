// Raspberry Pi GPIO Remote Control WebInterface
// NOTE: Raspberry Pi GPIO access requires sudo 
// $ sudo node app.js 8080
// $ npm start (for testing, will use port 8080)
//
// to test websockets version use:
// $ sudo node app.js 8080 websockets

var flatiron = require('flatiron'),
    path = require('path'),
    ecstatic = require('ecstatic'),
    app = flatiron.app,
    rpi_gpio = require('rpi-gpio'),
    tcpport = 8080,
    flag_use_websockets = false;

var gpio_status = {
        "GPIO_04": false,
        "GPIO_17": false,
        "GPIO_21": false,
        "GPIO_22": false,
        "GPIO_23": false,
        "GPIO_24": false,
        "GPIO_25": false,
        "WEBSOCKETS": false
    };  

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
    gpio_status["WEBSOCKETS"] = true;
}
else {
    console.log("Using default Http REST protocol!");
    gpio_status["WEBSOCKETS"] = false;
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
            console.log('Written to pin number '+gpionumber+' ('+gpioname+') value:'+value+'\r\n');
            gpio_status[gpioname] = value;
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

// flatiron router - REST to get gpio_status
app.router.get('/gpiostatus', function () {
    // responding back to the brower request
    this.res.writeHead(200, {'Content-Type':'application/json'});
    this.res.write(JSON.stringify(gpio_status));
    this.res.end();
});

// flatiron router - REST GPIO commands
app.router.get('/gpio/:cmd', function (cmd) {

    console.log('\r\nParsing REST gpio command: '+cmd);

    // decode SPACE and ; chars (previously encoded in client)
    var gpio = cmd;
    //var gpio = cmd.replace(/_/g, " ");
    gpio = gpio.replace(/--/g, ";");

    console.log('Decoded gpio command: '+gpio);

    // check if it contains a multiple gpio commands (will use ; as separator)
    if(gpio.indexOf(";") != -1) {

        var gpio_array=gpio.split(";");
        var gpio_cmd;

        for(var i=0, len=gpio_array.length; i<len; i++) {
            gpio_cmd=unescape(gpio_array[i].replace(/\+/g, " ")); // url decode
            console.log("GPIO"+i.toString()+"="+gpio_cmd);
            gpioCmd(gpio_cmd);
        }
    }
    else {
        var gpio0=gpio;
        gpio0=unescape(gpio0.replace(/\+/g, " ")); // url decode
        console.log("GPIO="+gpio0);
        gpioCmd(gpio0);
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

      socket.on('gpiodata', function(data) {
          console.log('Received GPIO Data: '+data.wsdata);
            var gpio0=data.wsdata;
            console.log("GPIO="+gpio0);
            gpioCmd(gpio0);
            // broadcast to all clients the new received update command for GPIO (cmd replication)
            socket.broadcast.emit('gpionewstatus', { newdata: data.wsdata });
      });
  });
}

function gpioCmd(gpio0) {
    var value = true;
    if(gpio0.indexOf("RESET_") != -1)
        value = false;

    if(gpio0.indexOf("SET_GPIO_04") != -1 || gpio0.indexOf("RESET_GPIO_04") != -1) {
        gpioWrite(7,  'GPIO_04', value).call();
    }
    else if(gpio0.indexOf("SET_GPIO_17") != -1 || gpio0.indexOf("RESET_GPIO_17") != -1) {
        gpioWrite(11, 'GPIO_17', value).call();
    }
    else if(gpio0.indexOf("SET_GPIO_21") != -1 || gpio0.indexOf("RESET_GPIO_21") != -1) {
        gpioWrite(13, 'GPIO_21', value).call();
    }
    else if(gpio0.indexOf("SET_GPIO_22") != -1 || gpio0.indexOf("RESET_GPIO_22") != -1) {
        gpioWrite(15, 'GPIO_22', value).call();
    }
    else if(gpio0.indexOf("SET_GPIO_23") != -1 || gpio0.indexOf("RESET_GPIO_23") != -1) {
        gpioWrite(16, 'GPIO_23', value).call();
    }
    else if(gpio0.indexOf("SET_GPIO_24") != -1 || gpio0.indexOf("RESET_GPIO_24") != -1) {
        gpioWrite(18, 'GPIO_24', value).call();
    }
    else if(gpio0.indexOf("SET_GPIO_25") != -1 || gpio0.indexOf("RESET_GPIO_25") != -1) {
        gpioWrite(22, 'GPIO_25', value).call();
    }
};

// CTRL+C (sigint)
process.on( 'SIGINT', function() {
  console.log("Unexport GPIO!");
  gpioClose();
  
  console.log( "Gracefully shutting down from  SIGINT (Crtl-C)");
  process.exit( )
});