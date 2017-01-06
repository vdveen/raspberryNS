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

// ~~~~BEGIN USER CONFIGURATION~~~~
// You can change these values and (if you make sure they are valid)
// the app should work properly. All input values must be between
// quotation marks: "value".

// The input API authentication and station.
// Request a key here: https://www.ns.nl/ews-aanvraagformulier/
var username = "your@emailadress.com";
var password = "YoUrApIkEyFrOmNs";

// Station strings can be case-insensitive station names or 3-letter codes:
// e.g. "Delft", "delft", "dt" and "Dt" are valid inputs.
var station = "Rotterdam Centraal";

// Any train that departs within the next [timedelta] minutes
// will not be displayed (including current minute). Default is zero.
var timedelta = 0;

// The web app checks whether a train's end destination OR a train's Route Text
// contains the below emphasistrain text. This train is given a highlight.
var emphasisstation = "Utrecht";
// If you don't want this feature, remove the // in the next row:
//var emphasisstation = "~"


// ~~~~END USER CONFIGURATION~~~~


var responseTarget;
var express = require("express");
var app     = express();
var path    = require("path");
var ns = require ('ns-api') ({
  username: username,
  password: password
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
  ns.vertrektijden(station, nsInfo);
});

// Function that is called by the NS-API with our precious data.
function nsInfo(error, data)
{
  // Send the data from the ns-api to our response target.
  // Also include the input station name for display next to the clock.
  // Also include the train to emphasize
  data[0].StartStation=capitalizeFirstLetter(station);
  data[0].EmphasisStation=capitalizeFirstLetter(emphasisstation)
  data[0].TimeDelta=timedelta
  responseTarget.send(data);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


//-------FINALIZE SERVER SETUP-------
app.listen(3000);

console.log("Running at Port 3000");
