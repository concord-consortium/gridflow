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
  this.baseSupply = [5 + Math.random(),
4 + Math.random(),
3 + Math.random(),
4 + Math.random()];
  this.baseDemand = [3 + Math.random(),
        2 + Math.random(),
        3 + Math.random(),
        3 + Math.random()];
  this.gameState.globals.supply = [
    {
      "wind": this.baseSupply[0]
    },
    {
      "solar": this.baseSupply[1]
    },
    {
      "fossil": this.baseSupply[2]
    },
    {
      "wind": this.baseSupply[3]
    }
  ]
  // Average demand
  this.gameState.globals.demand = [
    this.baseDemand[0], this.baseDemand[1], this.baseDemand[2], this.baseDemand[3]
  ],
  this.update(0);
}
module.exports.prototype.update = function (elapsed) {
  var cycle = -Math.cos(2 * elapsed / this.gameState.DAY_LENGTH * Math.PI);
  this.gameState.globals.supply[0].wind = this.gameState.globals.supply[0].wind * 0.8 + this.baseSupply[0] * 0.2 + 2 * Math.random() - 1;
  this.gameState.globals.supply[1].solar = this.baseSupply[1] * (cycle + 1);
  this.gameState.globals.supply[2].fossil = this.gameState.globals.supply[2].fossil * 0.9 + this.baseSupply[2] * 0.1 + Math.random() * 0.4 - 0.2;
  this.gameState.globals.supply[3].wind = this.gameState.globals.supply[3].wind * 0.8 + this.baseSupply[3] * 0.2 + Math.random() - 0.5 - cycle * 2 + 2;
  this.gameState.globals.demand[0] = this.baseDemand[0] + cycle + 0.5 * elapsed / this.gameState.DAY_LENGTH;
  this.gameState.globals.demand[1] = this.baseDemand[1] + cycle + 0.5 * elapsed / this.gameState.DAY_LENGTH;
  this.gameState.globals.demand[2] = this.baseDemand[2] + cycle + 0.5 * elapsed / this.gameState.DAY_LENGTH;
  this.gameState.globals.demand[3] = this.baseDemand[3] + cycle + 0.5 * elapsed / this.gameState.DAY_LENGTH;
}
