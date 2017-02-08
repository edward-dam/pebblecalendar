//Author: Ed Dam

module.exports = [
  { "type": "heading", "defaultValue": "Calendar v3.0" },
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
    { "type": "heading", "defaultValue": "Heading" },
    { "type": "text", "defaultValue": "Please Choose Location or Brand" },
    { "type": "radiogroup", "messageKey": "BRAND", "options": [
      { "label": "Location", "value": "false" },
      { "label": "Pebble Brand", "value": "true" } ],
    "defaultValue": "false" } ]
  },
  { "type": "section", "capabilities": ["HEALTH"], "items": [
    { "type": "heading", "defaultValue": "Weather & Health" },
    { "type": "text", "defaultValue": "Please Choose Weather or Health" },
    { "type": "radiogroup", "messageKey": "HEALTH", "options": [
      { "label": "Weather", "value": "false" },
      { "label": "Steps/Sleep", "value": "true" } ],
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
  { "type": "text", "defaultValue": "Thank you for using my watchface." },
  { "type": "submit", "defaultValue": "Save Settings" }
];
