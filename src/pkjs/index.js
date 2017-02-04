// Author: Ed Dam

// clayjs
var Clay = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

// xml http request
var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

// talk to OpenWeather
function locationSuccess(pos) {
  var apiKey = '42efb17b4ad3d4a52025106d13376d96';
  var url = 'http://api.openweathermap.org/data/2.5/weather' +
  '?lat=' + pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + apiKey;
  xhrRequest(url, 'GET', function(responseText) {
    var json = JSON.parse(responseText);
    var name = json.name;
    var icon = json.weather[0].icon;
    var temp_cel = Math.round(json.main.temp - 273.15);
    var temp_fah = Math.round((json.main.temp - 273.15) * 9 / 5 + 32);
    var weather;
    if ( icon === "01d" || icon === "01n" ) {
      weather = "Clear Sky";
    } else if ( icon === "02d" || icon === "02n" ) {
      weather = "Few Clouds";
    } else if ( icon === "03d" || icon === "03n" ) {
      weather = "Cloudy";
    } else if ( icon === "04d" || icon === "04n" ) {
      weather = "Cloudy";
    } else if ( icon === "09d" || icon === "09n" ) {
      weather = "Showery";
    } else if ( icon === "10d" || icon === "10n" ) {
      weather = "Rainy";
    } else if ( icon === "11d" || icon === "11n" ) {
      weather = "Thundery";
    } else if ( icon === "13d" || icon === "13n" ) {
      weather = "Snowy";
    } else if ( icon === "50d" || icon === "50n" ) {
      weather = "Misty";
    } else {
      weather = "Unknown";
    }
    //console.log('Collected name: ' + name);
    //console.log('Collected icon: ' + icon);
    //console.log('Collected temp_cel: ' + temp_cel);
    //console.log('Collected temp_fah: ' + temp_fah);
    //console.log('Determined weather: ' + weather);
    var dictionary = {
      'LOCATION': name,
      'WEATHER':  weather,
      'TEMP_CEL': temp_cel,
      'TEMP_FAH': temp_fah
    };
    Pebble.sendAppMessage(dictionary);
  });
}

function locationError(err) {
  console.log('Error: Requesting Location!');
}

// get gps location
function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// listen for when the watchface is opened
Pebble.addEventListener('ready',
  function(e) {
    //console.log('PebbleKit JS ready!');
    getWeather();
  }
);
