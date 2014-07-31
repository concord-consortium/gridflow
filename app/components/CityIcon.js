/**
 * CityIcon.js
 * Displays a clickable city, optionally with lights!
 * (Mostly typed with Dvorak!)
 */
var width = 512,
  height = 336;
module.exports = function () {
  "use strict";
  this.color = 0;
  this.drawable = new PIXI.DisplayObjectContainer();
  this.drawable.interactive = true;
  this.lightPercentage = 1;
  // The lightmask masks the light to show a half-filled city.
  this.lightMask = new PIXI.Graphics();
  this.drawable.addChild(this.lightMask);
  this.icon = new PIXI.Sprite.fromImage("images/CityIcon.png");
  this.iconLights = new PIXI.Sprite.fromImage("images/CityIconLights.png");
  this.iconLights.mask = this.lightMask;
  this.iconBorder = new PIXI.Sprite.fromImage("images/CityIconBorder.png");
  this.icon.hitArea =
    this.iconLights.hitArea =
    this.iconBorder.hitArea = new PIXI.Rectangle(0, 0, width, height);
  this.icon.visible = false;
  this.iconLights.visible = false;
  this.iconBorder.visible = false;
  this.drawable.addChild(this.icon);
  this.drawable.addChild(this.iconLights);
  this.drawable.addChild(this.iconBorder);
  this.update();
};
/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  "use strict";
  this.lightMask.clear();
  this.lightMask.beginFill();
  this.lightMask.drawRect(0, height * (1 - this.lightPercentage), width, height * this.lightPercentage);
  this.lightMask.endFill();
};
