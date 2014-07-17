/*
 * GameState.js
 * An object to hold and synchronize data behind the game.
 */
var Dynamics = require("core/Dynamics");
module.exports = function () {
  "use strict";
  this.sync = {};
  this.host = false;
  this.islandName = "";
  // The numerical id (0-3) of the city
  this.cityId = undefined;
  // The current city object
  this.currentCity = undefined;
  // The host's global variables
  this.globals = undefined;
  // The current stage object
  this.currentStage = undefined;
  // The firebase object
  this.firebase = undefined;
  // The time from which the game starts.
  this.startTime = undefined;
  // A flag to update the current stage.
  this.hasUpdated = true;
  this.dynamics = new Dynamics(this);
  // Constants
  this.FIREBASE_URL = "https://popping-fire-8949.firebaseio.com/";
  this.MAX_CITIES = 4;
  // Time is all in milliseconds
  this.DAY_LENGTH = 60 * 1000;
  this.WIN_AFTER = 5 * this.DAY_LENGTH;
  this.UPDATE_INTERVAL = 2 * 1000;
  this.ENERGY_SEND_LENGTH = 8 * this.DAY_LENGTH / 24;
  this.ENERGY_PER_CONTRACT = 1;
  this.BLACKOUT_DELAY = 8 * this.DAY_LENGTH / 24;
  this.ENERGY_COLOR = 0xfff36a;
  this.MISSING_ENERGY_COLOR = 0xff0000;
  this.EXTRA_ENERGY_COLOR = 0x00c617;
  this.ENERGY_COLOR = 0xfff36a;
  this.MAX_ENERGY = 12;
  this.CITY_COLORS = [
    0xffa701,
    0x42c355,
    0x358de5,
    0x9b2ed4
  ];
};
// Connect to an island
module.exports.prototype.connect = function (islandName) {
  "use strict";
  this.islandName = islandName;
  this.firebase = new Firebase(this.FIREBASE_URL + this.islandName);
  this.firebase.once("value", function (data) {
    var val = data.val(),
      i;
    if (this.cityId == undefined) {
      // Initial joining
      if (val == undefined || !(val.hasOwnProperty(0)) || val[0] == undefined) {
        // Create new session
        this.host = true;
        this.cityId = 0;
      } else {
        // Join existing session
        this.sync = val;
        for (i = 1; i < this.MAX_CITIES; i++) {
          if (this.sync[i] == undefined) {
            this.cityId = i;
            break;
          }
        }
        if (this.cityId == undefined) {
          alert("Session is full.");
          this.firebase.off();
          return;
        }
      }
      // Listen to other cities
      this.firebase.child(this.cityId).onDisconnect().set(null);
      for (i = 0; i < this.MAX_CITIES; i++) {
        if (i !== this.cityId) {
          addCityListener.call(this, i);
        }
      }
      this.resetCity();
    }
  }, this);
}
// Returns total number of connected cities
module.exports.prototype.countCities = function (cityNumber) {
  var i, sum = 0;
  for (i = 0; i < this.MAX_CITIES; i++) {
    if (this.sync[i] != undefined) {
      sum++;
    }
  }
  return sum;
}
// Sync the current city to the other cities
module.exports.prototype.syncCity = function () {
  this.firebase.child(this.cityId).set(this.sync[this.cityId]);
  this.hasUpdated = true;
}
// Listen for changes in the other cities
var addCityListener = function (city) {
    this.firebase.child(city).on("value", function (data) {
      this.sync[city] = data.val();
      if (city === 0) {
        this.globals = this.sync[0].globals;
      }
      if (this.sync[0] == undefined) {
        // Host disconnected!
        console.error("Host disconnected!");
        this.firebase.off();
      }
      this.hasUpdated = true;
    }, this);
  }
  // Resets the city for the beginning of a game
module.exports.prototype.resetCity = function (status) {
  // Reset some variables
  this.startTime = undefined;
  // Set up the city
  this.currentCity = this.sync[this.cityId] = {
    // Whether the "ready" button is pressed
    "ready": false,
    // Outgoing energy
    "outgoing": [],
    // Whether or not the city has blacked out
    "blackout": false
  };
  // Host has extra metadata
  if (this.host === true) {
    this.globals = this.currentCity.globals = {
      // startTime is also used as an indicator of playing/not playing
      "playing": false,
      "startTime": null,
      // A cityId if a city blacked out, or true on win.
      "status": status === undefined ? null : status,
      "timeOffset": [
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random()
      ],
      // Energy sources and their max production
      "supply": [],
      // Average demand
      "demand": []
    }
    this.dynamics.init();
  }
  this.hasUpdated = true;
  this.syncCity();
}
