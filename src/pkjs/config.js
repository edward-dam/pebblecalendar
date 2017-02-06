//Author: Ed Dam

module.exports = [
  { "type": "heading", "defaultValue": "Calendar v2.1" },
  { "type": "text", "defaultValue": "by Edward Dam" },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Time" },
    { "type": "text", "defaultValue": "Please Choose 24 Hours or 12 Hours" },
    { "type": "radiogroup", "messageKey": "HOUR", "options": [
      { "label": "24 Hours", "value": "false" },
      { "label": "12 Hours", "value": "true" } ],
    "defaultValue": "false" } ]
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Date" },
    { "type": "text", "defaultValue": "Please Choose Date Order" },
    { "type": "radiogroup", "messageKey": "DATE", "options": [
      { "label": "DD - MM", "value": "false" },
      { "label": "MM - DD", "value": "true" } ],
    "defaultValue": "false" } ]
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Temperature" },
    { "type": "text", "defaultValue": "Please Choose Fahrenheit or Celsius" },
    { "type": "radiogroup", "messageKey": "DEGREE", "options": [
      { "label": "Fahrenheit °F", "value": "false" },
      { "label": "Celsius °C", "value": "true" } ],
    "defaultValue": "false" } ]
  },
  { "type": "section", "items": [
    { "type": "heading", "defaultValue": "Location" },
    { "type": "text", "defaultValue": "Please Choose Location or Pebble Logo" },
    { "type": "radiogroup", "messageKey": "LOGO", "options": [
      { "label": "Location", "value": "false" },
      { "label": "Pebble Logo", "value": "true" } ],
    "defaultValue": "false" } ]
  },
  { "type": "text", "defaultValue": "Thank you for using my watchface." },
  { "type": "submit", "defaultValue": "Save Settings" }
];
