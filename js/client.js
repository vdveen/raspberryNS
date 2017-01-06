// This file is what continually runs the page, fetches data from 
// the NS API and updates the clock and load bar 


// Functions to start when building of the HTML document is ready:
$(function(){

// Get the info and get it ad infinitum every 60 seconds
getInfo()
setInterval(getInfo,60000);
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
    url: 'http://127.0.0.1:3000/GetTrainData',
    success: function(data)
    {
      trainData = data;
      updatePage();
    },
    error: function(error)
    {
      console.log(error);
    }
  });
}

// Updates our HTML page with the most current train data.
function updatePage()
{
  // Feed station name to header
  // If the name is too long, don't include 'Station' so it'll fit
  currstation = trainData[0].StartStation
  if (currstation.length < 20) {
    $("#station").text("Station "+ currstation)
  } else {
    $("#station").text(currstation)
  }

  // Loop through the retreived list of trains from the API.
  // Fill h1, h2 and h3 tags in the div trein with the data.
  var train;
  var date = new Date();
  var hr = date.getHours();
  var min = date.getMinutes();
  var totaltime = 60*hr + min;
  var counter = 0

  for (train in trainData){
    // If this train departs in the next [timedelta] minutes,
    // continue to the next train.
    var trainhr = (trainData[train].VertrekTijd).slice(11,13);
    var trainmin = (trainData[train].VertrekTijd).slice(14,16);
    var traintime = 60*parseInt(trainhr) + parseInt(trainmin) -1;
    if (traintime < totaltime + trainData[0].TimeDelta) {
      continue
    }

    // H1 text is for the dep time and end station
    var currenth1 = "#t"+ counter + "h1";
    var time = (trainData[train].VertrekTijd).slice(11,16);
    var h1text =  time + " \t" + trainData[train].EindBestemming;
    $(currenth1).text(h1text);

    // H2 text is for displaying the dep track, train type and route text
    // in that order.
    var currenth2 = "#t"+ counter + "h2";
    var vs = trainData[train].VertrekSpoor;
    vs = "Spoor " + vs;
    var ts = trainData[train].TreinSoort;

    // H3 Text is for disruptions and emergencies.
    // In case of changed departure track:
    var currenth3 = "#t"+ counter + "h3";
    var h3text = "";
    if (trainData[train].VertrekSpoorWijziging == true){
      h3text = vs;
      vs = "";
    } else {
      ts = " " + ts
    }

    // Display the route tekst if it exists.
    // Occurs after departure track changes because that part
    // strips h2 of its departure track if there are changes.
    var h2text =  vs + ts;
    if (typeof trainData[train].RouteTekst != 'undefined'){
      var via = trainData[train].RouteTekst;
      h2text = h2text + " via " + via;
    }
    $(currenth2).text(h2text);


    // In case of an operator that isn't NS:
    if ((trainData[train].Vervoerder).slice(0,2) != "NS") {
      h3text = trainData[train].Vervoerder + h3text;
    }

    // In case of delays:
    if (typeof trainData[train].VertrekVertragingTekst != 'undefined'){
      h3text = trainData[train].VertrekVertragingTekst + " "+ h3text;
    }

    // In case of additional notes, often 'Rijdt vandaag niet' (Won't depart today)
    if (typeof trainData[train].Opmerkingen != 'undefined'){
      h3text = h3text + " "+ trainData[train].Opmerkingen.Opmerking;
    }

    // If any of the disruption cases is triggered, its info is displayed in red
    $(currenth3).text(h3text)

    // Check if the current train needs emphasis by comparing its end
    // destination and its route text.
    var needsemph = false;
    if (trainData[train].EindBestemming.search(trainData[0].EmphasisStation)>=0) {
      needsemph = true;
    }
    if (typeof trainData[train].RouteTekst != "undefined") {
      if (trainData[train].RouteTekst.search(trainData[0].EmphasisStation) >=0) {
      needsemph = true;
      }
    }
    // If an emphasis train is given, it wil display with more margin
    // and an added background color.

    if (needsemph) {
      document.getElementById(currenth1.slice(1)).style.backgroundColor = "#f2f9fc";
      document.getElementById(currenth2.slice(1)).style.backgroundColor = "#f2f9fc";
      document.getElementById(currenth3.slice(1)).style.backgroundColor = "#f2f9fc";
    } else {
      document.getElementById(currenth1.slice(1)).style.backgroundColor = "#fff";
      document.getElementById(currenth2.slice(1)).style.backgroundColor = "#fff";
      document.getElementById(currenth3.slice(1)).style.backgroundColor = "#fff";
    }

    counter = counter + 1;
    // End this loop once the first 6 trains has been put on the page
    if (counter > 8) {
      break
    }
  }
}

// Creates a clock to put on the header
function updateClock() {
    var date = new Date();
    var hr = date.getHours()
    var min = date.getMinutes()
    var sec = date.getSeconds()
    min = checkTime(min);
    sec = checkTime(sec);
    $("#time").text(hr+":"+min+":"+sec)
    var t = setTimeout(updateClock, 500);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
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
