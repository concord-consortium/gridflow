/*
 * BarChart.js
 * Creates a horizontal bar chart in PIXI with customizable
 * color(s), widths, and height.
 *
 * Each bar segment has a value (width) and color. A segment
 * with a value of maxSegmentValue will be the entire width
 * of the BarChart.
 */
var Utils = require("core/Utils");

module.exports = function (width, height, segmentValues, segmentColors, maxSegmentValue) {
  "use strict";
  this.width = width || 0;
  this.height = height || 0;
  this.segmentValues = segmentValues || [];
  this.segmentColors = segmentColors || [];
  this.maxSegmentValue = maxSegmentValue || 0;
  this.drawable = new PIXI.Graphics();
  this.update();
};

/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  "use strict";
  var previous = 0,
    i, segmentWidth;
  this.drawable.clear();
  for (i = 0; i < this.segmentValues.length; i++) {
    this.drawable.beginFill(this.segmentColors[i]);
    segmentWidth = this.width * this.segmentValues[i] / this.maxSegmentValue;
    this.drawable.drawRect(previous, 0, Utils.clamp(segmentWidth, 0, this.width - previous), this.height);
    previous += segmentWidth;
    this.drawable.endFill();
  }
};
