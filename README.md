# raspberryNS
An information screen using the NS API designed as a small Raspberry Pi web app.

![Imgur](http://i.imgur.com/3yjXawKm.png) ![Imgur](http://i.imgur.com/HQtqq2sm.jpg)

Developed by vdveen. This local web app will fetch departure information from any NS station in the Netherlands and display it realtime in the browser. 

## Installation guide:
The app runs on NodeJS and two NPM packages. Some Raspberry Pi's might need node-semver as a dependancy for NodeJS. 
`$ sudo apt-get install nodejs npm node-semver`
`$ npm install express ns-api`

It also requires an API key. This can be obtained from https://www.ns.nl/ews-aanvraagformulier/. Open the ns.js file and edit the following in the 'User Configuration' part of the script:

* Add your username and API key after the var username and var password. Make sure they are between quotation marks.
* [Optionally] Change the station that you want information to be displayed from. 
* [Optionally] Change the 'timedelta' variable. Setting this to 5 will make the information screen skip over all trains departing in the next 5 minutes.
* [Optionally] Change the highlighted station. A departing train is highlighted if its destination or route text contains the combination of letters defined here. 


How to run: basically, run this file in the terminal using node. CD to the correct folder:
`cd ~/[yourpath]/webapp`

Then, run the ns.js file in Node:
`.../webapp  node ns.js`

Then, open any web browser and go to `127.0.0.1:3000`. 

If you want to have the server run when starting your Raspberry Pi, you can append a line of code to your [rc.local file.](https://www.raspberrypi.org/documentation/linux/usage/rc-local.md) 
