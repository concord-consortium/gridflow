/*
 * ContractLine.js
 * A line that represents a contract.
 */
'use strict';

var backgroundTextureFor = {
  outer: new PIXI.Texture.fromImage('images/outerContractLineBackground.png'),
  inner: new PIXI.Texture.fromImage('images/innerContractLineBackground.png')
};

// base texture for contract lines to outermost cities
var baseTextureFor = {
  outer: new PIXI.BaseTexture.fromImage('images/outerContractLineDotsSpritesheet.png'),
  inner: new PIXI.BaseTexture.fromImage('images/innerContractLineDotsSpritesheet.png')
};

var spritesheetDataFor = {
  outer: require('data/spritesheets/outerContractLineDotsSpritesheet'),
  inner: require('data/spritesheets/innerContractLineDotsSpritesheet')
};

var frameIndicesFor = {
  outer: {
    away: {
      filling: [0, 39],
      steadyState: [40, 43],
      emptying: [44, 81]
    },
    towards: {
      filling: [82, 117],
      steadyState: [118, 121],
      emptying: [122, 155]
    }
  },
  inner: {
    away: {
      filling: [0, 38],
      steadyState: [39, 42],
      emptying: [43, 81]
    },
    towards: {
      filling: [82, 117],
      steadyState: [115, 118],
      emptying: [122, 155]
    }
  }
};

var dotOffsetFor = {
  outer: { x: 12, y: 85 },
  inner: { x: 14, y: 101 }
};

var ANIMATION_FPS = 24;
var MS_PER_FRAME = 1000 / ANIMATION_FPS;

var EMPTY_TEXTURE = new PIXI.Texture(baseTextureFor.outer, new PIXI.Rectangle(0, 0, 0, 0));

function nFrames(indices, which) {
  return indices[which][1] - indices[which][0] + 1;
}

function msToFrames(ms) {
  return Math.floor(ms/MS_PER_FRAME);
}

/* jshint -W040*/
function updateDots() {
  var frameIndices;
  var spritesheetData;
  var baseTexture;

  frameIndices = frameIndicesFor[this.innerOrOuter][this.awayOrTowards];
  spritesheetData = spritesheetDataFor[this.innerOrOuter];
  baseTexture = baseTextureFor[this.innerOrOuter];

  if (this.contractLength > 0) {
    var nEmptying = nFrames(frameIndices, 'emptying');
    var framesFromEnd = msToFrames(this.contractStart + this.contractLength - this.elapsed);

    if (framesFromEnd < nEmptying) {
      setDotsTexture.call(this, frameIndices.emptying[1] - framesFromEnd, baseTexture, spritesheetData);
      return;
    }
  }

  var framesFromStart = msToFrames(this.elapsed - this.contractStart);
  var nFilling = nFrames(frameIndices, 'filling');

  if (framesFromStart < nFilling) {
    setDotsTexture.call(this, frameIndices.filling[0] + framesFromStart, baseTexture, spritesheetData);
    return;
   } else {
     var period = nFrames(frameIndices, 'steadyState');
     var offset = (framesFromStart - nFilling) % period;
     setDotsTexture.call(this, frameIndices.steadyState[0] + offset, baseTexture, spritesheetData);
   }
}

function setDotsTexture(index, baseTexture, spritesheetData) {

  var frame = spritesheetData.frames[index].frame;
  var offset = spritesheetData.frames[index].spriteSourceSize;

  if (index !== this._lastIndex) {
    // TODO also cache textures
    var texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
    this.dots.setTexture(texture);
    this.dots.x = offset.x;
    this.dots.y = offset.y;
    this._lastIndex = index;
  }
}
/* jshint +W040*/

module.exports = function(cityPair, awayOrTowards) {

  this.innerOrOuter = cityPair === 1 ? 'inner' : 'outer';

  this.drawable = new PIXI.DisplayObjectContainer();

  // hack, because the background image has both the 'away' line and the 'from' line
  // (if both 'away' and 'toward' contractLines show it, then two identical sprites
  // are added, and one is on top of the other's dots)
  if (awayOrTowards === 'away') {
    this.background = new PIXI.Sprite(backgroundTextureFor[this.innerOrOuter]);
    this.drawable.addChild(this.background);
  }

  this.dotsContainer = new PIXI.DisplayObjectContainer();
  this.dotsContainer.x = dotOffsetFor[this.innerOrOuter].x;
  this.dotsContainer.y = dotOffsetFor[this.innerOrOuter].y;

  this.dots = new PIXI.Sprite(EMPTY_TEXTURE);
  this.dotsContainer.addChild(this.dots);
  this.drawable.addChild(this.dotsContainer);

  this.cityPair = cityPair; // 0, 1, or 2
  this.awayOrTowards = awayOrTowards; // 'away' = away from player
  this.hasContract = false;
  this.conractStart = 0;
  this.contractLength = 0;
  this.elapsed = 0;

  this.update();
};

/**
 * Updates the graphics object
 */
module.exports.prototype.update = function() {
  if ( this.hasContract ) {
    this.dotsContainer.visible = true;
    updateDots.call(this);
  } else {
    this.dotsContainer.visible = false;
  }
};
