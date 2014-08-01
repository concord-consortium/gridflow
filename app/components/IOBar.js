/**
 * IOBar.js
 * Shows the supply and demand in one handy bar!
 * (Typed with Dvorak!)
 */
module.exports = function (width, height, maxEnergy) {
  "use strict";
  this.width = width || 0;
  this.height = height || 0;
  this.maxEnergy = maxEnergy || 0;
  this.supply = 0;
  this.supplyRounded = 0;
  this.demand = 0;
  // The gap between distinct energy units
  this.gap = 6;
  // The width of the demand line (which is actually a rectangle)
  this.demandWidth = 6;
  // The amount that the demand line protrudes from the top and bottom (which is actually a rectangle)
  this.demandHeight = 15;
  this.drawable = new PIXI.Graphics();
  this.update();
};
/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  "use strict";
  var i;
  // Draw the background bar
  this.drawable.clear();
  this.drawable.beginFill(0x000000);
  this.drawable.drawRect(0, 0, this.supply * this.width / this.maxEnergy, this.height);
  this.drawable.endFill();
  // Draw the minor unit bars
  for (i = 0; i < this.supplyRounded; i++) {
    this.drawable.beginFill(0x666666);
    this.drawable.drawRect(i * this.width / this.maxEnergy, 0, this.width / this.maxEnergy - this.gap, this.height);
    this.drawable.endFill();
  }
  // Draw the demand line
  this.drawable.beginFill(0xFF0000);
  this.drawable.drawRect(this.demand * this.width / this.maxEnergy, -this.demandHeight, this.demandWidth, this.height + 2 * this.demandHeight);
  this.drawable.endFill();
};
