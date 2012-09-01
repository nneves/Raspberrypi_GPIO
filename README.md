Raspberrypi_GPIO
================

Remote control appliances via WebInterface by using a RaspberryPi + Node.js + GPIO Relay control board (turning On/Off a coffee machine, toaster, heater, etc from a webpage in your mobile phone, tablet or laptop)

Work in progress ... (GPIO remote control completed, some optimization required)


General Purpose Input/Output (GPIO)
http://elinux.org/Rpi_Low-level_peripherals#General_Purpose_Input.2FOutput_.28GPIO.29

GPIO Driving Example (Shell script)
http://elinux.org/Rpi_Low-level_peripherals#GPIO_Driving_Example_.28Shell_script.29

Safe control GPIO from command line
http://quick2wire.com/2012/05/safe-controlled-access-to-gpio-on-the-raspberry-pi/
https://github.com/quick2wire/quick2wire-gpio-admin

Raspberry Pi GPIO node.js packages
https://github.com/JamesBarwell/rpi-gpio.

How to compile node.js on a RaspberryPi
https://github.com/nneves/Raspberrypi_NodeJS

Install Node.js necessary packages
```bash
git clone git://github.com/nneves/Raspberrypi_GPIO.git

cd Raspberrypi_GPIO

npm install
```

Raspberry Pi GPIO access requires sudo
```bash
sudo node server.js 8080

or (for quick testing)

npm start
```

Experimental testing with WebSockets protocol
```bash
sudo node server.js 8080 websockets
```

License
=======
Copyright (C) 2012 Nelson Neves

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see http://www.gnu.org/licenses/agpl-3.0.html