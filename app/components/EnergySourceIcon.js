/**
 * EnergySourceIcon.js
 * Displays an energy source (wind/solar/fossil) below the player's city
 */
'use strict';

var baseTexture = new PIXI.BaseTexture.fromImage('images/energySourcesSpritesheet.png');
var baseSpritesheetData = require('data/spritesheets/energySourcesSpritesheet');

var generatorTextures = {
  fossil: new PIXI.BaseTexture.fromImage('images/coalPlantSpritesheet.png'),
  wind:   new PIXI.BaseTexture.fromImage('images/windTurbineSpritesheet.png'),
  solar:  new PIXI.BaseTexture.fromImage('images/solarPanelSpritesheet.png')
};

var generatorSpritesheetData = {
  fossil: require('data/spritesheets/coalPlantSpritesheet'),
  wind:   require('data/spritesheets/windTurbineSpritesheet'),
  solar:  require('data/spritesheets/solarPanelSpritesheet')
};

// relative location of "generator" (coal plant, wind turbine, etc) sprite
var GENERATOR_OFFSET = {
  fossil: [{ x: 0, y: 16 }],
  wind:   [{ x: 20, y: -55 }],
  solar:  [{ x: 25, y: 10 }, { x: 25, y: -14 }]
};

// relative location of "base" (yellow "platform" under city) sprite
var BASE_OFFSET = {
  fossil: { x: 68 - 50, y: 95 + (150 - 85) - 89 },
  wind:   { x: 0, y: 0 },
  solar:  { x: 0, y: 0 }
};

var DELAY_BETWEEN_FRAMES = {
  fossil: 2,
  wind:   3,
  solar:  3
};

function updateGeneratorTexture() {
  /* jshint -W040*/
  var texinfo = this.generatorTextureInfo[this.generatorTextureIndex];

  this.generatorSprites.forEach(function(generatorSprite, index) {
    generatorSprite.setTexture(texinfo.texture);
    generatorSprite.x = GENERATOR_OFFSET[this.type][index].x + texinfo.offset.x;
    generatorSprite.y = GENERATOR_OFFSET[this.type][index].y + texinfo.offset.y;
  }.bind(this));

  /* jshint +W040*/
}

module.exports = function(type) {
  var frame = _.where(baseSpritesheetData.frames, { filename: type })[0].frame;
  var texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
  var generatorTexture = generatorTextures[type];

  this.type = type;
  this.visible = false;

  this.drawable = new PIXI.DisplayObjectContainer();
  this.baseSprite = new PIXI.Sprite(texture);
  this.baseSprite.x = BASE_OFFSET[this.type].x;
  this.baseSprite.y = BASE_OFFSET[this.type].y;

  this.drawable.addChild(this.baseSprite);

  this.generatorTextureInfo = generatorSpritesheetData[this.type].frames.map(function(obj) {
    var frame = obj.frame;
    return {
      texture: new PIXI.Texture(generatorTexture, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h)),
      offset: obj.spriteSourceSize
    };
  });

  this.generatorSprites = GENERATOR_OFFSET[type].map(function() {
    return new PIXI.Sprite(this.generatorTextureInfo[0].texture);
  }.bind(this));

  this.generatorTextureIndex = 0;
  updateGeneratorTexture.call(this);

  this.generatorSprites.forEach(function(sprite) {
    this.drawable.addChild(sprite);
  }.bind(this));

  this.delayCounter = 0;

  this.update();
};

module.exports.prototype.update = function() {
  this.drawable.visible = this.visible;

  if (this.visible) {
    if (this.delayCounter === 0) {
      updateGeneratorTexture.call(this);
      this.generatorTextureIndex = (this.generatorTextureIndex + 1) % this.generatorTextureInfo.length;
    }
    this.delayCounter = (this.delayCounter + 1) % DELAY_BETWEEN_FRAMES[this.type];
  } else {
    this.generatorTextureIndex = 0;
  }
};
