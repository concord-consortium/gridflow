/*
 * GameState.js
 * An object to hold and synchronize data behind the game.
 */
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
  // Constants
  this.FIREBASE_URL = "https://popping-fire-8949.firebaseio.com/";
  this.MAX_CITIES = 4;
  // Length of day in milliseconds
  this.DAY_LENGTH = 3 * 1000;
  this.WIN_AFTER = 5 * this.DAY_LENGTH;
};
// Connect to an island
module.exports.prototype.connect = function () {
  "use strict";
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
          console.error("Session is full!");
          this.firebase.off();
          return;
        }
      }
      // Listen to other cities
      this.firebase.child(this.cityId).onDisconnect().set(null);
      for (i = 0; i < this.MAX_CITIES; i++) {
        if (i !== this.cityId) {
          this.addCityListener(i);
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
module.exports.prototype.addCityListener = function (city) {
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
  if (this.cityId === 0) {
    this.globals = this.currentCity.globals = {
      // startTime is also used as an indicator of playing/not playing
      "playing": false,
      "startTIme": null,
      // A cityId if a city blacked out, or true on win.
      "status": status === undefined ? null : status
    }
  }
  this.hasUpdated = true;
  this.syncCity();
}
