/**
 * IOBar.js
 * Shows the supply and demand in one handy bar!
 */
'use strict';

var baseTexture = new PIXI.BaseTexture.fromImage('images/meterSpritesheet.png');
var spritesheetData = require('data/spritesheets/meterSpritesheet');

function getTexture(name) {
  // we don't bother caching, because we only expect to be instantiated 1x
  var frame = _.where(spritesheetData.frames, { filename: name })[0].frame;
  return new PIXI.Texture(baseTexture, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
}

var LEFT_EDGE = spritesheetData.leftEdge;
var RIGHT_EDGE = spritesheetData.rightEdge;

function xPositionForValue(value) {
  /* jshint -W040 */
  return (RIGHT_EDGE - LEFT_EDGE) * value / this.maxValue;
  /* jshint +W040 */
}

module.exports = function(maxValue) {

  // state properties -- client code will set these before calling update()
  this.supply = 0;
  this.demand = 0;

  this.maxValue = maxValue;

  // graphical elements
  this.drawable = new PIXI.DisplayObjectContainer();
  this._background = new PIXI.Sprite(getTexture('background'));
  this._foreground = new PIXI.Sprite(getTexture('foreground'));
  this._foregroundMask = new PIXI.Graphics();
  this._needle = new PIXI.Sprite(getTexture('needle'));

  // foreground (dark yellow) will be clipped to indicate available supply
  this._foreground.mask = this._foregroundMask;

  // center of needle indicates demand; bottom of needle "rests" on bottom of meter
  this._needle.anchor.x = 0.5;
  this._needle.anchor.y = 1;
  this._needle.y = this._background.height;

  [this._background, this._foreground, this._foregroundMask, this._needle].forEach(function(child) {
    this.drawable.addChild(child);
  }.bind(this));

  this.update();
};

/**
 * Updates the graphics object
 */
module.exports.prototype.update = function() {

  // this clips the foreground element
  this._foregroundMask.clear();
  this._foregroundMask.beginFill();
  this._foregroundMask.drawRect(0, 0, xPositionForValue.call(this, this.supply), this._background.height);
  this._foregroundMask.endFill();

  this._needle.position.x = xPositionForValue.call(this, this.demand);
};
