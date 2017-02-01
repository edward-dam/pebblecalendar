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

// Draw Text

function drawText(ctx, text, color, align, font, width, height) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.font      = font;
  ctx.fillText(text, width, height);
}

// Collect Setting Options

var config_hour;
var config_date;

rocky.postMessage({command: 'settings'});

rocky.on('message', function(event) {
  var message = event.data;
  if ( message.config_hour && message.config_date ) {
    config_hour = message.config_hour;
    config_date = message.config_date;
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
  //drawLine(ctx, 1, 'black', cy - 68, mx);
  drawLine(ctx, 1, 'black', cy - 42, mx);
  drawLine(ctx, 2, 'black', cy + 1,  mx);
  drawLine(ctx, 1, 'black', cy + 43, mx);
  //drawLine(ctx, 1, 'black', cy + 70, mx);
  
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
  drawText(ctx, dateMinute, 'black', 'left', '49px Roboto-subset', cx + 7,  cy - 31);

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
  drawText(ctx, dateDay,   'black', 'center', '24px bold Gothic', cx,       cy - 60);
  drawText(ctx, dateLeft,  'black', 'left',   '24px bold Gothic', cx - 60,  cy + 25);
  drawText(ctx, dateRight, 'black', 'left',   '24px bold Gothic', cx - 20,  cy + 25);
  drawText(ctx, dateYear,  'black', 'left',   '24px bold Gothic', cx + 20,  cy + 25);

  // Draw Location/Weather
  drawText(ctx, 'Woking Town',   'black', 'center', '18px bold Gothic', cx,  cy - 82);
  drawText(ctx, 'Raining',  'black', 'center', '18px bold Gothic', cx - 22,  cy + 56);
  drawText(ctx, '50°',      'black', 'center', '18px bold Gothic', cx + 49,  cy + 57);
  
});
