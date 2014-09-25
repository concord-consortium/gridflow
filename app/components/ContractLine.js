/*
 * ContractLine.js
 * A line that represents a contract.
 */
'use strict';

// base texture for contract lines to outermost cities
var baseTextureFor = {
  outer: new PIXI.BaseTexture.fromImage('images/outerContractLineDotsSpritesheet.png'),
  inner: null
};

var spritesheetDataFor = {
  outer: require('data/spritesheets/outerContractLineDotsSpritesheet'),
  inner: null
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
      steadyState: [118, 123],
      emptying: [124, 155]
    }
  },
  inner: {}
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
  var innerOrOuter;
  var frameIndices;
  var spritesheetData;
  var baseTexture;

  if (this.cityPair === 1) {
    innerOrOuter = 'inner';
    // we don't have artwork for the middle city pair yet
    return;
  } else {
    innerOrOuter = 'outer';
  }

  frameIndices = frameIndicesFor[innerOrOuter][this.awayOrTowards];
  spritesheetData = spritesheetDataFor[innerOrOuter];
  baseTexture = baseTextureFor[innerOrOuter];

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
  // TODO cache!!!
  var frame = spritesheetData.frames[index].frame;
  var offset = spritesheetData.frames[index].spriteSourceSize;

  var texture = new PIXI.Texture(baseTexture, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
  this.dots.setTexture(texture);
  this.dots.x = offset.x;
  this.dots.y = offset.y;
}
/* jshint +W040*/

module.exports = function(cityPair, awayOrTowards) {
  this.drawable = new PIXI.DisplayObjectContainer();
  this.dots = new PIXI.Sprite(EMPTY_TEXTURE);
  this.drawable.addChild(this.dots);

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
    this.dots.visible = true;
    updateDots.call(this);
  } else {
    this.dots.visible = false;
  }
};
