/**
 * flow.js
 * Computes energy flow and updates the UI with computation.
 */
// Prune outgoing tree: e.g. remove expired requests
// NOTE: Use .call with this being the gameState.
module.exports.pruneOutgoing = function () {
  "use strict";
  var elapsed = Date.now() - this.startTime,
    i, changed = false;
  for (i = 0; i < this.currentCity.outgoing.length; i++) {
    if (this.currentCity.outgoing[i].until <= elapsed) {
      this.currentCity.outgoing.splice(i, 1);
      i--;
      changed = true;
    }
  }
  if (changed == true) {
    this.syncCity();
  }
};

// NOTE: Use .call with this being the gameState.
module.exports.sendEnergy = function (dest, amount) {
  "use strict";
  // No double sending!
  if (module.exports.getEnergyTo.call(this, dest) == null) {
    var elapsed = Date.now() - this.startTime;
    this.currentCity.outgoing.push({
      dest: dest,
      until: elapsed + this.ENERGY_SEND_LENGTH,
      amount: amount
    });
    this.syncCity();
  }
};

// Returns the contract object for receiving from a given city
// NOTE: Use .call with this being the gameState.
module.exports.getEnergyFrom = function (city) {
  "use strict";
  var cityData = this.sync[city],
    i, check, elapsed = Date.now() - this.startTime;
  if (cityData.outgoing == undefined) {
    return null;
  }
  for (i = 0; i < cityData.outgoing.length; i++) {
    check = cityData.outgoing[i];
    if (check.dest === this.cityId && check.until > elapsed) {
      return check;
    }
  }
  return null;
}

// Returns the contract object for sending to a given city
// NOTE: Use .call with this being the gameState.
module.exports.getEnergyTo = function (city) {
  "use strict";
  var i, check, elapsed = Date.now() - this.startTime;
  for (i = 0; i < this.currentCity.outgoing.length; i++) {
    check = this.currentCity.outgoing[i];
    if (check.dest === city && check.until > elapsed) {
      return check;
    }
  }
  return null;
}

//Get source energy
// NOTE: Use .call with this being the gameState.
module.exports.getSource = function () {
  return this.globals.supply[this.cityId];
}
