/*
 * GameState.js
 * An object to hold and synchronize data behind the game.
 */
module.exports = function () {
  this.sync = {};
  this.host = false;
  this.islandName = "";
  this.cityId = null;
  this.currentCity = null;
  this.currentStage = null;
  this.hasUpdated = true;
  
  // Constants
  this.FIREBASE_URL = "https://popping-fire-8949.firebaseio.com/";
  this.MAX_CITIES = 4;
}
// Connect to an island
module.exports.prototype.connect = function () {
  this.firebase = new Firebase(this.FIREBASE_URL + this.islandName);
  this.firebase.once("value", function (data) {
    var val = data.val(), i;
    if (this.cityId === null) {
      // Initial joining
      if(val === null || !(0 in val) || val[0] === null){
        // Create new session
        this.host = true;
        this.cityId = 0;
      }
      else {
        // Join existing session
        this.sync = val;
        for (i = 1; i < this.MAX_CITIES; i++) {
          if(!this.cityExists(i)){
            this.cityId = i;
            break;
          }
        }
        if (this.cityId === null) {
          alert("Session is full.");
          console.error("Session is full!");
          this.firebase.off();
          return;
        }
      }
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
      if(this.cityId === 0){
        this.currentCity.globals = {
          // id of whoever blacks out
          blackout: null,
          // startTime is also used as an indicator of playing/not playing
          startTime: null,
        
        }
      }
      // Listen to other cities
      this.firebase.child(this.cityId).onDisconnect().set(null);
      for(i = 0; i < this.MAX_CITIES; i++) {
        if(i !== this.cityId){
          this.addCityListener(i);
        }
      }
      this.syncCity();
      this.hasUpdated = true;
    }
  }, this);
}
// Check to see if a city exists
module.exports.prototype.cityExists = function (cityNumber) {
  return (cityNumber in this.sync)&&this.sync[cityNumber]!==null;
}
// Returns total number of connected cities
module.exports.prototype.countCities = function (cityNumber) {
  var i, sum = 0;
  for (i = 0; i < this.MAX_CITIES; i++) {
    if(this.cityExists(i)){
      sum++;
    }
  }
  return sum;
}
// Sync the current city to the other cities
module.exports.prototype.syncCity = function () {
  this.firebase.child(this.cityId).set(this.sync[this.cityId]);
}
// Listen for changes in the other cities
module.exports.prototype.addCityListener = function (city) {
  this.firebase.child(city).on("value", function (data){
    this.sync[city] = data.val();
    if(this.cityExists(0) === false){
      // Host disconnected!
      console.error("Host disconnected!");
      this.firebase.off();
    }
    this.hasUpdated = true;
  }, this);
}