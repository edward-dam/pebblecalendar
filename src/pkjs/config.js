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
  { "type": "text", "defaultValue": "Thank you for using my watchface." },
  { "type": "submit", "defaultValue": "Save Settings" }
];
