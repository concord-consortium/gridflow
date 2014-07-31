/*
 * ContractLine.js
 * A line that represents a contract.
 */
var Utils = require("core/Utils"),
  ants = 10,
  antRatio = 0.4,
  width = 20,
  antSubtractedWidth = 10;
module.exports = function (xSource, ySource, xDest, yDest) {
  "use strict";
  this.xSource = xSource || 0;
  this.ySource = ySource || 0;
  this.xDest = xDest || 0;
  this.yDest = yDest || 0;
  // The progression of the contract, or 1 - time remaining
  this.progress = 0;
  // The amount of energy (the width)
  this.amount = 1;
  // The current time to drive the ants
  this.elapsed = 0;
  this.color = 0;
  this.active = false;
  this.drawable = new PIXI.Graphics();
  this.update();
};
/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  "use strict";
  var elapsedOffset = (this.elapsed % 200) / 200,
    i, progressFrom, progressTo;
  this.drawable.clear();
  if (this.active) {
    this.drawable.lineStyle(width, 0xFFFFFF, 0.3);
  } else {
    this.drawable.lineStyle(width, 0xFFFFFF, 0.2);
  }
  this.drawable.moveTo(this.xSource, this.ySource);
  this.drawable.lineTo(this.xDest, this.yDest);
  if (this.active) {
    this.drawable.lineStyle(width * this.amount, this.color);
    this.drawable.moveTo(this.xSource, this.ySource);
    this.drawable.lineTo(Utils.lerp(this.xSource, this.xDest, this.progress), Utils.lerp(this.ySource, this.yDest, this.progress));
  }
  if (this.active) {
    // Draw back line
    // Draw marching ants
    for (i = -1; i < ants; i++) {
      progressFrom = Utils.clamp((i + elapsedOffset) / ants, 0, 1);
      progressTo = Utils.clamp((i + elapsedOffset + antRatio) / ants, 0, 1);
      if (progressFrom < progressTo) {
        this.drawable.lineStyle(width * this.amount - antSubtractedWidth, 0x000000, 0.5);
        this.drawable.moveTo(Utils.lerp(this.xSource, this.xDest, progressFrom), Utils.lerp(this.ySource, this.yDest, progressFrom));
        this.drawable.lineTo(Utils.lerp(this.xSource, this.xDest, progressTo), Utils.lerp(this.ySource, this.yDest, progressTo));
      }
    }
  }
};
