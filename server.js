// Raspberry Pi GPIO Remote Control WebInterface
// >node server.js 8080

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    gpio = require("gpio"),
    tcpport = 8080;

// maps / exports gpio pins
var rpi_gpio4 = gpio.export(4);  // returns a gpio pin instance and exports that pin    

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

http.createServer(function(req, res) {
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
                rpi_gpio4.set();
                console.log("GPIO4_VALUE: "+gpio4.value);
            }
            else if(gpio0 === "RESET_GPIO_04")
            {
                rpi_gpio4.set(0);
                console.log("GPIO4_VALUE: "+gpio4.value);
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

http.on('close', function(){
    console.log("Closing Server - Unexport GPIO!");
    gpio4.unexport();
});

console.log('Raspberry Pi GPIO WebInterface Server running on port '+tcpport);
