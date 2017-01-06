// This file is what continually runs the page, fetches data from 
// the NS API and updates the clock and load bar 

// CONFIGURATION
var portNumber = 3000;
var refreshRate = 60; // in seconds
var defaultBackgroundColor = "#fff";
var emphasisBackgroundColor = "#f2f9fc";

// END OF CONFIGURATION


// Functions to start when building of the HTML document is ready:
$(function(){
  // Get the info and get it ad infinitum every 60 seconds
  getInfo();
  setInterval(getInfo, refreshRate * 1000);
  // Update the clock in the header
  updateClock();
  // Update the refresh line below the header
  refreshLine();
});

// Function that creates a GET request to our ns.js NodeJS server.
var trainData;
function getInfo()
{
  $.ajax({    // Using AJAX because it's neater and easier
    type: 'GET',
    url: 'http://127.0.0.1:' + portNumber + '/GetTrainData',
    success: function(data)
    {
      updatePage(data);
    },
    error: function(error)
    {
      console.log(error);
    }
  });
}

// Updates our HTML page with the most current train data.
function updatePage(trainData)
{
  // Feed station name to header
  // If the name is too long, don't include 'Station' so it'll fit
  var trainStart=trainData[0];
  currstation = trainStart.StartStation;
  if (currstation.length < 20) {
    $("#station").text("Station "+ currstation);
  } else {
    $("#station").text(currstation);
  }

  // Loop through the retreived list of trains from the API.
  // Fill h1, h2 and h3 tags in the div trein with the data.

  var train;
  var counter = 0;
  var delta = parseInt(trainStart.TimeDelta, 10);

  var date = new Date();
  var trainDateTime = new Date(trainStart.VertrekTijd);

  for (train in trainData){
    // If this train departs in the next [timedelta] minutes,
    // continue to the next train.
    var currentTrain = trainData[train];
    var trainDateTime = new Date(currentTrain.VertrekTijd);
    var traintime = trainDateTime.getTime() - 60; // use a minute extra

    if (traintime < (date.getTime() + delta)) {
      continue;
    }

    // H1 text is for the dep time and end station
    var $currenth1 = $("#t"+ counter + "h1");
    var h1text =  pad(trainDateTime.getHours()) + ':' +  pad(trainDateTime.getMinutes()) + " \t" + currentTrain.EindBestemming;
    $currenth1.text(h1text);
    console.log(h1text);
    // H2 text is for displaying the dep track, train type and route text
    // in that order.
    var $currenth2 = $("#t"+ counter + "h2");
    var vs = "Spoor " + currentTrain.VertrekSpoor;
    var ts = currentTrain.TreinSoort;

    // H3 Text is for disruptions and emergencies.
    // In case of changed departure track:
    var $currenth3 = $("#t"+ counter + "h3");
    var h3text = "";
    if (currentTrain.VertrekSpoorWijziging){
      h3text = vs;
      vs = "";
    } else {
      ts = " " + ts;
    }

    // Display the route tekst if it exists.
    // Occurs after departure track changes because that part
    // strips h2 of its departure track if there are changes.
    var h2text =  vs + ts;
    if (typeof currentTrain.RouteTekst != 'undefined'){
      var via = currentTrain.RouteTekst;
      h2text = h2text + " via " + via;
    }
    $currenth2.text(h2text);


    // In case of an operator that isn't NS:
    if ((currentTrain.Vervoerder).slice(0,2) != "NS") {
      h3text = currentTrain.Vervoerder + h3text;
    }

    // In case of delays:
    if (typeof currentTrain.VertrekVertragingTekst != 'undefined'){
      h3text = currentTrain.VertrekVertragingTekst + " "+ h3text;
    }

    // In case of additional notes, often 'Rijdt vandaag niet' (Won't depart today)
    if (typeof currentTrain.Opmerkingen != 'undefined'){
      h3text = h3text + " "+ currentTrain.Opmerkingen.Opmerking;
    }

    // If any of the disruption cases is triggered, its info is displayed in red
    $currenth3.text(h3text)

    // Check if the current train needs emphasis by comparing its end
    // destination and its route text.
    var needsemph = false;
    if (currentTrain.EindBestemming.search(trainData[0].EmphasisStation)>=0) {
      needsemph = true;
    }
    if (typeof currentTrain.RouteTekst != "undefined") {
      if (currentTrain.RouteTekst.search(trainData[0].EmphasisStation) >=0) {
      needsemph = true;
      }
    }
    // If an emphasis train is given, it wil display with more margin
    // and an added background color.

    var useBackgroundColor = needsemph ? emphasisBackgroundColor : defaultBackgroundColor;
    $currenth1.css('background-color', useBackgroundColor);
    $currenth2.css('background-color', useBackgroundColor);
    $currenth3.css('background-color', useBackgroundColor);

    counter = counter + 1;
    // End this loop once the first 6 trains has been put on the page
    if (counter > 8) {
      break;
    }
  }
}

// Creates a clock to put on the header
function updateClock() {
    var date = new Date();
    var hr = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    $("#time").text(pad(hr)+":"+pad(min)+":"+pad(sec));
    var t = setTimeout(updateClock, 1000);
}

function refreshLine() {
  var elem = document.getElementsByClassName("hr");
  var width = 0.1;
  var id = setInterval(frame, 60);
  function frame() {
      if (width >= 100) {
          clearInterval(id)
          width = 0.1;
          elem[0].style.width = 0 + '%';
          refreshLine()
      } else {
          width = width+0.1;
          elem[0].style.width = width + '%';
      }
  }
}
// adding zeroes
function pad(n){return n<10 ? '0'+n : n}
