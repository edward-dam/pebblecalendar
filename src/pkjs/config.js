//Author: Ed Dam

module.exports = [
  { "type": "heading", "defaultValue": "Calendar v1.0" },
  { "type": "text", "defaultValue": "by Edward Dam" },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Time" },
    { "type": "text", "defaultValue": "Please Choose 24 Hours or 12 Hours" },
    { "type": "radiogroup", "messageKey": "config_hour", "options": [
      { "label": "24 Hours", "value": "24hours" },
      { "label": "12 Hours", "value": "12hours" } ],
    "defaultValue": "24hours" } ]
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Date" },
    { "type": "text", "defaultValue": "Please Choose Date Order" },
    { "type": "radiogroup", "messageKey": "config_date", "options": [
      { "label": "Day - Month", "value": "daymonth" },
      { "label": "Month - Day", "value": "monthday" } ],
    "defaultValue": "daymonth" } ]
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Temperature" },
    { "type": "text", "defaultValue": "Please Choose Fahrenheit or Celsius" },
    { "type": "radiogroup", "messageKey": "config_temp", "options": [
      { "label": "Fahrenheit °F", "value": "fahrenheit" },
      { "label": "Celsius °C", "value": "celsius" } ],
    "defaultValue": "fahrenheit" } ]
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Location" },
    { "type": "text", "defaultValue": "Please Choose Location or Pebble Logo" },
    { "type": "radiogroup", "messageKey": "config_logo", "options": [
      { "label": "Location GPS", "value": "location" },
      { "label": "Pebble Logo", "value": "pebble" } ],
    "defaultValue": "location" } ]
  },
  { "type": "text", "defaultValue": "Thank you for using my watchface." },
  { "type": "submit", "defaultValue": "Save Settings" }
];
