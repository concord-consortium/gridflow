/**
 * VisualClock.js
 * Visualizes time in a handy banner
 * (Typed with Dvorak!)
 */
var Utils = require("core/Utils");

module.exports = function (width, height) {
  "use strict";
  this.width = width || 0;
  this.height = height || 0;
  this.day = 0;
  this.drawable = new PIXI.Graphics();
  this.update();
};
/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  "use strict";
  this.drawable.clear();
  this.drawable.beginFill(
    Utils.lerpColor(
      // Day/night color
      Utils.lerpColor(0x96c7ff, 0x114083,
        Utils.clamp(0.5 + Math.cos(2 * Math.PI * this.day), 0, 1)),
      // Sunset color
      0xff6d1e, Utils.clamp(-3 - 3.5 * Math.sin(Math.PI / 2 + 4 * Math.PI * this.day), 0, 1)));
  this.drawable.drawRect(0, 0, this.width, this.height);
  this.drawable.endFill();
};
