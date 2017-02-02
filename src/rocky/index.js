// Author: Ed Dam

// Rocky.js

var rocky = require('rocky');

// Draw Line

function drawLine(ctx, linewidth, color, position, width) {
  ctx.lineWidth   = linewidth;
  ctx.strokeStyle = color;
  ctx.strokeRect(0, position, width, 0);
}

// Draw Box

function drawBox(ctx, color, x, y, width, height) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

// Draw Dot
function drawDot(ctx, color, x, y, radius) {
  ctx.fillStyle = color;
  ctx.rockyFillRadial(x, y, 0, radius, 0, 2 * Math.PI);
}

// Draw Text

function drawText(ctx, text, color, align, font, width, height) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font      = font;
  ctx.fillText(text, width, height);
}

// Collect Setting Options & Weather Data

var config_hour;
var config_date;
var config_temp;
var config_logo;
var api_weather;

rocky.postMessage({command: 'settings'});

rocky.on('message', function(event) {
  var message = event.data;
  if ( message.config_hour && message.config_date && message.config_temp && message.config_logo ) {
    config_hour = message.config_hour;
    config_date = message.config_date;
    config_temp = message.config_temp;
    config_logo = message.config_logo;
    rocky.requestDraw();
  }
  if ( message.weather ) {
    api_weather = message.weather;
    rocky.requestDraw();
  }
});

// Redraw Every Minute

rocky.on('minutechange', function(event) {
  rocky.requestDraw();
});

// Draw Watchface

rocky.on('draw', function(event) {
  var ctx = event.context;
  
  // Define Screen Size
  var mx = ctx.canvas.unobstructedWidth;
  var my = ctx.canvas.unobstructedHeight;
  
  // Clear Canvas
  ctx.clearRect(0, 0, mx, my);
  
  // Define Centre of Screen
  var cx = mx / 2;
  var cy = my / 2;
  
  // Draw Boxes
  drawBox(ctx, 'white', cx - 65, cy - 78, 130, 18);
  drawBox(ctx, 'white', cx - 65, cy - 55, 130, 25);
  drawBox(ctx, 'white', cx - 65, cy - 25, 60,  50);
  drawBox(ctx, 'white', cx + 5,  cy - 25, 60,  50);
  drawBox(ctx, 'white', cx - 65, cy + 30, 30,  25);
  drawBox(ctx, 'white', cx - 25, cy + 30, 30,  25);
  drawBox(ctx, 'white', cx + 15, cy + 30, 50,  25);
  drawBox(ctx, 'white', cx - 65, cy + 60, 85,  18);
  drawBox(ctx, 'white', cx + 30, cy + 60, 35,  18);
  
  // Draw Lines
  drawLine(ctx, 2, 'black', cy - 42, mx);
  drawLine(ctx, 2, 'black', cy +  0, mx);
  drawLine(ctx, 2, 'black', cy + 42, mx);
  
  // Draw Dots
  drawDot(ctx, 'black', cx - 58, cy - 69, 4);
  drawDot(ctx, 'black', cx + 58, cy - 69, 4);
  
  // Draw Time
  var numsHour;
  if ( config_hour === "12hours" ) {
    numsHour = ['12','01','02','03','04','05','06','07','08','09','10','11','12','01','02','03','04','05','06','07','08','09','10','11'];
  } else {
    numsHour = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
  }
  var dateHour   = numsHour[new Date().getHours()];
  var dateMinute = new Date().toLocaleTimeString(undefined, {minute: '2-digit'});
  drawText(ctx, dateHour,   'black', 'left', '49px Roboto-subset', cx - 63, cy - 31);
  drawText(ctx, dateMinute, 'black', 'left', '49px Roboto-subset', cx +  7, cy - 31);

  // Draw Date Day-Month
  var dateDay    = new Date().toLocaleDateString(undefined, {day:   'long'});
  var dateDate   = new Date().toLocaleDateString(undefined, {day:   '2-digit'});
  var dateMonth  = new Date().toLocaleDateString(undefined, {month: '2-digit'});
  var dateYear   = new Date().toLocaleDateString(undefined, {year:  'numeric'});
  var dateLeft;
  var dateRight;
  if ( config_date === "monthday" ) {
    dateLeft = dateMonth;
    dateRight = dateDate;
  } else {
    dateLeft = dateDate;
    dateRight = dateMonth;
  }
  drawText(ctx, dateDay,   'black', 'center', '24px bold Gothic', cx +  0,  cy - 60);
  drawText(ctx, dateLeft,  'black', 'left',   '24px bold Gothic', cx - 60,  cy + 25);
  drawText(ctx, dateRight, 'black', 'left',   '24px bold Gothic', cx - 20,  cy + 25);
  drawText(ctx, dateYear,  'black', 'left',   '24px bold Gothic', cx + 20,  cy + 25);

  // Draw Location/Weather Template
  drawText(ctx, 'Location', 'black', 'center', '18px bold Gothic', cx +  0,  cy - 82);
  drawText(ctx, 'Weather',  'black', 'center', '18px bold Gothic', cx - 22,  cy + 56);
  drawText(ctx, '?°',       'black', 'center', '18px bold Gothic', cx + 49,  cy + 57);
  
  // Redraw Location
  if ( config_logo === "pebble" ) {
    drawBox(ctx, 'white', cx - 65, cy - 78, 130, 18);
    drawDot(ctx, 'black', cx - 58, cy - 69, 4);
    drawDot(ctx, 'black', cx + 58, cy - 69, 4);
    drawText(ctx, 'pebble', 'black', 'center', '18px bold Gothic', cx + 0, cy - 82);
  } else {
    if ( api_weather ) {
      var city = api_weather.location;
      drawBox(ctx, 'white', cx - 65, cy - 78, 130, 18);
      drawDot(ctx, 'black', cx - 58, cy - 69, 4);
      drawDot(ctx, 'black', cx + 58, cy - 69, 4);
      drawText(ctx, city, 'black', 'center', '18px bold Gothic', cx + 0, cy - 82);
    }
  }

  // Redraw Weather
  if ( api_weather ) {
    var weather;
    var icon = api_weather.icon;
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
    drawBox(ctx, 'white', cx - 65, cy + 60, 85, 18);
    drawText(ctx, weather, 'black', 'center', '18px bold Gothic', cx - 22, cy + 56);
  }
  
  // Redraw Temperature
  if ( api_weather ) {
    var temperature;
    if ( config_temp === "celsius" ) {
      temperature = Math.round(api_weather.temp - 273.15);
    } else {
      temperature = Math.round((api_weather.temp - 273.15) * 9 / 5 + 32);
    }
    drawBox(ctx, 'white', cx + 30, cy + 60, 35, 18);
    drawText(ctx, temperature + '°', 'black', 'center', '18px bold Gothic', cx + 49, cy + 57);
  }
  
});
