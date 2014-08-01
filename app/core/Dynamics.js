/**
 * Dynamics.js
 * Changes supply and demand as time goes on.
 */
var Utils = require("core/Utils");

module.exports = function (gameState) {
  "use strict";
  this.gameState = gameState;
};
module.exports.prototype.init = function () {
  "use strict";
  var i, j;
  this.gameState.globals.supply = [];
  this.gameState.globals.demand = [];
  for (i = 0; i < this.gameState.MAX_CITIES; i++) {
    this.gameState.globals.supply[i] = [];
  }
  this.update();
};
module.exports.prototype.update = function () {
  "use strict";
  var i, j, supply, computedSupply, cycle = -Math.cos(2 * Math.PI * this.gameState.levelTimer.getDay()),
    totalSupply = 0,
    relativeDemand = 0,
    players = this.gameState.globals.currentLevel.players;
  // Compute supply
  for (i = 0; i < players.length; i++) {
    for (j = 0; j < players[i].supply.length; j++) {
      computedSupply = 0;
      supply = players[i].supply[j];
      // Amount types, such as solar cycle based or random based
      if (supply.type == "fixed") {
        computedSupply = supply.amount;
      } else if (supply.type == "random") {
        if (this.gameState.globals.supply[i][j] === undefined) {
          computedSupply = supply.amount;
        } else {
          computedSupply = Utils.clamp(this.gameState.globals.supply[i][j] + (Math.random() * 2 - 1) * supply.variation, supply.amount - supply.maxVariation, supply.amount + supply.maxVariation);
        }
      } else if (supply.type == "cycle") {
        computedSupply = supply.amount + cycle * supply.variation;
      }
      this.gameState.globals.supply[i][j] = computedSupply;
      if (this.gameState.sync[i] != null) {
        // Difficulty scaling
        totalSupply += computedSupply;
      }
    }
    totalSupply = Math.floor(totalSupply);
    if (this.gameState.sync[i] != null) {
      // Difficulty scaling
      relativeDemand += players[i].relativeDemand;
    }
  }
  relativeDemand = relativeDemand + this.gameState.globals.currentLevel.extraEnergy;

  // Compute demand
  for (i = 0; i < players.length; i++) {
    this.gameState.globals.demand[i] = players[i].relativeDemand * totalSupply / relativeDemand;
  }
  /*for (i = 0; i < this.gameState.MAX_CITIES; i++) {
    var supply = this.gameState.globals.supply[i];
    if (supply[0] != undefined) {
      // Wind
      supply[0] = this.gameState.globals.supply[i][0] * 0.8 + this.baseSupply[i][0] * 0.2 + 2 * Math.random() - 1;
    }
    if (supply[1] != undefined) {
      // Solar
      supply[1] = this.baseSupply[i][1] * (cycle * 0.75 + 0.75);
    }
    if (supply[2] != undefined) {
      // Fossil
      supply[2] = this.gameState.globals.supply[i][2] * 0.9 + this.baseSupply[i][2] * 0.1 + Math.random() * 0.4 - 0.2;
    }
    this.gameState.globals.demand[i] = this.baseDemand[i] + cycle + 0.5 * elapsed / this.gameState.DAY_LENGTH;
  }*/
};
