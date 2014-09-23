/**
 * CityIcon.js
 * Displays a city
 */
'use strict';

var baseTexture = new PIXI.BaseTexture.fromImage('images/citiesSpritesheet.png');
var spritesheetData = require('data/spritesheets/citiesSpritesheet');
var textureCache = [];
var TEXTURE_OFFSETS = {
  large: 0,
  small: 16
};

// private methods (reference 'this')
/*jshint -W040*/
function getTextureIndex() {
  var baseIndex = TEXTURE_OFFSETS[this.largeOrSmall];

  if (baseIndex == null) {
    throw new Error("Unknown largeOrSmall value '" + this.largeOrSmall + "'");
  }

  return baseIndex + this.cityIndex + getBlackoutStage.call(this) * 4;
}

function getBlackoutStage() {
  if (this.largeOrSmall === 'small') {
    return 1 - Math.floor(this.lightPercentage);
  } else {
    return 3 - Math.floor(3 * this.lightPercentage);
  }
}
/*jshint +W040*/

// memoized function (shared across all instances)
function textureForIndex(index) {
  var texture = textureCache[index];
  var frame;

  if ( ! texture ) {
    frame = spritesheetData.frames[index].frame;
    texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
    textureCache[index] = texture;
  }

  return texture;
}

module.exports = function() {
  this.cityIndex = 0;
  this.largeOrSmall = 'large';
  this.lightPercentage = 1;

  this.sprite = this.drawable = new PIXI.Sprite(textureForIndex(getTextureIndex.call(this)));
  this.drawable.interactive = true;

  this.update();
};

/**
 * Updates the graphics object
 */
module.exports.prototype.update = function() {
  var texture = textureForIndex(getTextureIndex.call(this));

  // Pixi doesn't seem to check whether we're reassigning or not
  if (texture !== this.sprite.texture) {
    this.sprite.setTexture(texture);
  }
};
