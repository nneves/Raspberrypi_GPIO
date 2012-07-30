// Raspberry Pi GPIO Remote Control WebInterface
// NOTE: Raspberry Pi GPIO access requires sudo 
//$ sudo node server.js 8080

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    rpi_gpio = require('rpi-gpio'),
    tcpport = 8080;

// maps / exports gpio pins
rpi_gpio.setup(7, rpi_gpio.DIR_OUT, gpioWrite4);
rpi_gpio.setup(11, rpi_gpio.DIR_OUT, gpioWrite17);

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
// gpio unexport
function gpioClose() {
    rpi_gpio.destroy(function() {
        console.log('All pins unexported');
        return process.exit(0);
    });
}

// Processing parameters
if(process.argv[2] !== undefined && process.argv[2].trim() !== '') {
    tcpport = process.argv[2];
    console.log("Tcp/ip port parameter defined: "+tcpport);    
}
else {
    console.log("Using default tcp/ip port: "+tcpport);
}

// Http server
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

var httpserver = http.createServer(function(req, res) {
    // checking for default path /
    var uri = "";
    if(url.parse(req.url).pathname === "/") {
        uri = "/index.html";
    }
    else {
        uri = url.parse(req.url).pathname;
    }    
    var filename = path.join(process.cwd(), uri);

    // REST uri for GPIO interface
    var cmd = uri.split("/")[1];
    if(cmd.toUpperCase() === "GPIO") {
        console.log('Parsing REST gpio command');

        // spliting request in 2 and fetch parameter (only using 1 GET param)
        var gpio = uri.split("/")[2];
        console.log('Request Params: '+gpio);

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

            if(gpio0 === "SET_GPIO_05")
            {
                gpioWrite17(true);
                console.log("GPI17_VALUE: true");
            }
            else if(gpio0 === "RESET_GPIO_05")
            {
                gpioWrite17(false);
                console.log("GPI17_VALUE: false");
            }
        }

        // responding back to the brower request
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.write('ACK');
        res.end();
        return;
    }

    // Normal WebServer functionality
    console.log('\r\nRequest for:'+uri+' filename:'+filename);    

    // HTTP Server interface (serving html, css, js, jpeg, png ... files)
    path.exists(filename, function(exists) {
        if(!exists) {
            console.log("not exists: " + filename);
            res.writeHead(404, {'Content-Type':'text/plain'});
            res.write('Not Found\n');
            res.end();
            return;
        }
        // determine file mimeType from file extension
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200,  {'Content-Type':mimeType});

        // streaming file content using fileStream.pipe
        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);

    }); //end path.exists
}).listen(tcpport);

// Startup
console.log('Raspberry Pi GPIO WebInterface Server running on port '+tcpport);

// CTRL+C (sigint)
process.on( 'SIGINT', function() {
  console.log("Unexport GPIO!");
  gpioClose();
  
  console.log( "Gracefully shutting down from  SIGINT (Crtl-C)");
  process.exit( )
});
