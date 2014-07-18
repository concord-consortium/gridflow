/**
 * Dynamics.js
 * Changes supply and demand as time goes on.
 */
module.exports = function (gameState) {
  this.baseSupply = null;
  this.baseDemand = null;
  this.gameState = gameState;


};
module.exports.prototype.init = function () {
  var i, j;
  this.baseSupply = [
    [
      5 + Math.random(), //Wind
      null, //Solar
      1 //Fossil
    ],
    [
      2 + Math.random(), //Wind
      3 + Math.random(), //Solar
      null //Fossil
    ],
    [
      null, //Wind
      3 + Math.random(), //Solar
      2 + Math.random() //Fossil
    ],
    [
      2 + Math.random(), //Wind
      null, //Solar
      2 + Math.random() //Fossil
    ]
  ];
  this.baseDemand = [3 + Math.random(),
        2 + Math.random(),
        3 + Math.random(),
        3 + Math.random()];

  this.gameState.globals.supply = [];
  this.gameState.globals.demand = [];
  for (i = 0; i < this.gameState.MAX_CITIES; i++) {
    this.gameState.globals.supply[i] = {};
    for (j = 0; j < this.gameState.ENERGY_SOURCE_NAMES.length; j++) {
      this.gameState.globals.supply[i][j] = this.baseSupply[i][j];
    }
    this.gameState.globals.demand[i] = this.baseDemand[i];
  }
  this.update(0);
}
module.exports.prototype.update = function (elapsed) {
  var i, cycle = -Math.cos(2 * elapsed / this.gameState.DAY_LENGTH * Math.PI);
  for (i = 0; i < this.gameState.MAX_CITIES; i++) {
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
  }
}
