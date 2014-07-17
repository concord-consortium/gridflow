/*
 * FlowButton.js
 * Creates a button in PIXI with "Tap to send", a city color,
 * and two text field with two timers
 *
 * Each bar segment has a value (width) and color. A segment
 * with a value of maxSegmentValue will be the entire width
 * of the BarChart.
 */
module.exports = function (width, height) {
  "use strict";
  this.width = width || 0;
  this.height = height || 0;
  this.color = 0;
  this.drawable = new PIXI.DisplayObjectContainer();
  this.drawable.interactive = true;

  this.backgroundRect = new PIXI.Graphics();
  this.backgroundRect.hitArea = new PIXI.Rectangle(0, 0, width, height);
  this.drawable.addChild(this.backgroundRect);

  this.sendText = new PIXI.Text("", {
    font: "normal 40pt Arial"
  });
  this.sendText.position.set(0, height - 120);
  this.drawable.addChild(this.sendText);

  this.receiveText = new PIXI.Text("", {
    font: "normal 40pt Arial"
  });
  this.drawable.addChild(this.receiveText);

  this.centerLabel = new PIXI.Text("", {
    font: "normal 70pt Arial"
  });
  this.drawable.addChild(this.centerLabel);
  this.centerLabel.position.set(width / 2 - 30, height / 2 - 50);

  this.update();
};

module.exports.prototype.setLabel = function (label) {
  this.centerLabel.setText(label);
};
/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  "use strict";
  //Color the background
  this.backgroundRect.clear();
  this.backgroundRect.beginFill(this.color);
  this.backgroundRect.drawRect(0, 0, this.width, this.height);
  this.backgroundRect.endFill();
};
