/**
 * Flow.js
 * Computes energy flow, contracts, and the like.
 */

module.exports = function (gameState) {
  this.gameState = gameState;
  this.receive = {};
  this.send = {};
  this.sendSum = 0;
  this.receiveSum = 0;
  // How much from the power source actually used in the demand
  this.common = 0;
  // Extra energy generated
  this.extra = 0;
  // Missing energy from demand
  this.missing = 0;
};
// Prune outgoing tree: e.g. remove expired contracts
module.exports.prototype.pruneOutgoing = function () {
  "use strict";
  var i, changed = false,
    elapsed = this.gameState.levelTimer.getElapsed();
  for (i = 0; i < this.gameState.currentCity.outgoing.length; i++) {
    if (this.gameState.currentCity.outgoing[i].until != undefined && this.gameState.currentCity.outgoing[i].until <= elapsed) {
      this.gameState.currentCity.outgoing.splice(i, 1);
      i--;
      changed = true;
    }
  }
  if (changed == true) {
    this.gameState.syncCity();
  }
};

// Compute ingoing-outgoing
module.exports.prototype.computeFlow = function () {
  "use strict";
  this.receiveSum = 0;
  this.sendSum = 0;
  var i, from, to, demand;
  for (i = 0; i < this.gameState.MAX_CITIES; i++) {
    from = null;
    to = null;
    if (this.gameState.sync[i] != null && i !== this.gameState.cityId) {
      from = this.getEnergyFrom(i);
      if (from != null) {
        this.receiveSum += from.amount;
      }
      to = this.getEnergyTo(i);
      if (to != null) {
        this.sendSum += to.amount;
      }
    }
    this.receive[i] = from;
    this.send[i] = to;
  }
  this.extra = this.getTotalSource() - this.sendSum;
  demand = Math.max(0, this.getTotalDemand() - this.receiveSum);
  this.common = Math.min(this.extra, demand);
  this.extra -= this.common;
  this.missing = Math.max(0, demand - this.common);
};

module.exports.prototype.sendEnergy = function (dest) {
  "use strict";
  var contract, elapsed = this.gameState.levelTimer.getElapsed();
  if (this.gameState.globals.currentLevel.energyPerContract <= this.extra + this.common) {
    if (this.send[dest] == null) {
      contract = {
        dest: dest,
        amount: this.gameState.globals.currentLevel.energyPerContract
      };
      if (this.gameState.globals.currentLevel.contractLength >= 0) {
        contract.until = elapsed + this.gameState.globals.currentLevel.contractLength;
      }
      this.gameState.currentCity.outgoing.push(contract);
    } else if (this.gameState.globals.currentLevel.maxEnergyPerContract <= 0 || this.send[dest].amount < this.gameState.globals.currentLevel.maxEnergyPerContract) {
      // Renew contract with more energy
      this.send[dest].amount += this.gameState.globals.currentLevel.energyPerContract;
      if (this.gameState.globals.currentLevel.contractLength >= 0) {
        this.send[dest].until = elapsed + this.gameState.globals.currentLevel.contractLength;
      }
    }
    this.gameState.syncCity();
    this.computeFlow();
  }
};

// Returns the contract object for receiving from a given city
module.exports.prototype.getEnergyFrom = function (city) {
  "use strict";
  var cityData = this.gameState.sync[city],
    i, check, elapsed = this.gameState.levelTimer.getElapsed();
  if (cityData.outgoing == undefined) {
    return null;
  }
  for (i = 0; i < cityData.outgoing.length; i++) {
    check = cityData.outgoing[i];
    //NOTE: Timecheck is removed to solve issues on desynced clocks.
    if (check.dest === this.gameState.cityId) { // && (check.until == undefined || check.until > elapsed)) {
      return check;
    }
  }
  return null;
}

// Returns the contract object for sending to a given city
module.exports.prototype.getEnergyTo = function (city) {
  "use strict";
  var i, check, elapsed = this.gameState.levelTimer.getElapsed();
  for (i = 0; i < this.gameState.currentCity.outgoing.length; i++) {
    check = this.gameState.currentCity.outgoing[i];
    if (check.dest === city && (check.until == undefined || check.until > elapsed)) {
      return check;
    }
  }
  return null;
}

//Get source energy
module.exports.prototype.getSources = function () {
  return this.gameState.globals.supply[this.gameState.cityId];
}
module.exports.prototype.getTotalSource = function () {
  var sources = this.getSources(),
    total = 0,
    i;
  for (i = 0; i < sources.length; i++) {
    total += sources[i];
  }
  return total;
}

//Get demand energy
module.exports.prototype.getTotalDemand = function () {
  return this.gameState.globals.demand[this.gameState.cityId];
}
