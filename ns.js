// Developed by vdveen. Find me at github.com/vdveen
// This (Node)JS document acts as the server side
// for the client side to interact with.

// How to install all dependencies on the RPI:
// $ sudo apt-get install nodejs npm node-semver 
// $ npm install express ns-api

// How to run: open this file in the terminal using node
// C:/         cd ~/[yourpath]/webapp
// .../webapp  node ns.js
// Then, go to the web browser and go to 127.0.0.1:3000


require('dotenv').config();
var responseTarget;
var express = require("express");
var app     = express();
var path    = require("path");
var ns = require ('ns-api') ({
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

//-------START SERVER SETUP-------
app.use('/js',express.static(path.join(__dirname,'js')));
app.use('/css',express.static(path.join(__dirname,'css')));
app.use('/imgs',express.static(path.join(__dirname,'imgs')));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname,'/ns.html'));
  //__dirname : It will resolve to your project folder.
});

//-------RETURNING DATA FROM NS-------
// Function that is called from the web browser.
app.get('/GetTrainData', function(request, response){
  // Set the target we should send our data to.
  responseTarget = response;

  // Make a call to the NS API.
  ns.vertrektijden(process.env.STATION_START, nsInfo);
});

// Function that is called by the NS-API with our precious data.
function nsInfo(error, data)
{
  // Send the data from the ns-api to our response target.
  // Also include the input station name for display next to the clock.
  // Also include the train to emphasize
  data[0].StartStation=capitalizeFirstLetter(process.env.STATION_START);
  data[0].EmphasisStation=capitalizeFirstLetter(process.env.STATION_EMPHASIS);
  data[0].TimeDelta=process.env.TIME_DELTA;
  responseTarget.send(data);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//-------FINALIZE SERVER SETUP-------
app.listen(process.env.PORT);
console.log("Running at Port " + process.env.PORT);
