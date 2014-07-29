/**
 * Dynamics.js
 * Changes supply and demand as time goes on.
 */
module.exports = function (gameState) {
  this.gameState = gameState;
};
module.exports.prototype.init = function () {
  var i, j;
  this.gameState.globals.supply = [];
  this.gameState.globals.demand = [];
  for (i = 0; i < this.gameState.MAX_CITIES; i++) {
    this.gameState.globals.supply[i] = [];
  }
  this.update();
}
module.exports.prototype.update = function () {
  var i, j, supplyAmount, computedSupply, cycle = -Math.cos(2 * Math.PI * this.gameState.levelTimer.getDay()),
    totalSupply = 0,
    relativeDemand = 0,
    players = this.gameState.globals.currentLevel.players;
  // Compute supply
  for (i = 0; i < players.length; i++) {
    for (j = 0; j < players[i].supply.length; j++) {
      computedSupply = 0;
      supplyAmount = players[i].supply[j].amount;
      if (typeof supplyAmount === "number") {
        computedSupply = supplyAmount;
      }
      // TODO: Add more amount types, such as solar cycle based or random based
      this.gameState.globals.supply[i][j] = computedSupply;
      totalSupply += computedSupply;
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
      //Wind
      supply[0] = this.gameState.globals.supply[i][0] * 0.8 + this.baseSupply[i][0] * 0.2 + 2 * Math.random() - 1;
    }
    if (supply[1] != undefined) {
      //Solar
      supply[1] = this.baseSupply[i][1] * (cycle * 0.75 + 0.75);
    }
    if (supply[2] != undefined) {
      //Fossil
      supply[2] = this.gameState.globals.supply[i][2] * 0.9 + this.baseSupply[i][2] * 0.1 + Math.random() * 0.4 - 0.2;
    }
    this.gameState.globals.demand[i] = this.baseDemand[i] + cycle + 0.5 * elapsed / this.gameState.DAY_LENGTH;
  }*/
}
