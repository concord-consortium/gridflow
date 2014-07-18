/*
 * GameState.js
 * An object to hold and synchronize data behind the game.
 */
var Dynamics = require("core/Dynamics");
module.exports = function () {
  "use strict";
  this.sync = {};
  this.host = false;
  this.uid = (Math.random() + Date.now()).toString();
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
  this.ANIMATION_RATE = 0.05;
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
  this.ENERGY_SOURCE_NAMES = [
    "Wind",
    "Solar",
    "Fossil"
  ];
  this.ENERGY_SOURCE_COLORS = [
    0x58a581,
    0x585ea5,
    0x8d8d8d
  ];
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
  this.reconnect();
}
//Connects to or creates an existing session.
module.exports.prototype.reconnect = function () {
  this.firebase.once("value", function (data) {
    var val = data.val(),
      i;
    this.cityId = null;
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
        this.disconnect(true);
        return;
      }
    }
    // Listen to other cities
    this.firebase.child(this.cityId).onDisconnect().set(null);
    for (i = 0; i < this.MAX_CITIES; i++) {
      addCityListener.call(this, i);
    }
    this.resetCity();
  }, this);
}
//Removes listeners and the data from the server.
module.exports.prototype.disconnect = function (soft) {
  if (!soft && this.cityId != undefined) {
    this.firebase.child(this.cityId).set(null);
  }
  //Stop listening to other cities
  for (i = 0; i < this.MAX_CITIES; i++) {
    this.firebase.child(i).off();
  }
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
      var val = data.val();
      if (city === this.cityId) {
        if (val !== null && val.uid !== this.uid) {
          console.warn("Concurrent error.");
          this.disconnect(true);
          this.reconnect();
          return;
        }
      } else {
        this.sync[city] = val;
        if (this.sync[0] == undefined) {
          // Host disconnected!
          console.warn("Host disconnected!");
          this.disconnect();
          this.reconnect();
          return;
        }
        if (city === 0) {
          this.globals = this.sync[0].globals;
        }
        this.hasUpdated = true;
      }
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
    "blackout": false,
    "uid": this.uid
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
  } else {
    this.currentCity.globals = null;
  }
  this.hasUpdated = true;
  this.syncCity();
}