/**
 * HeaderBar.js
 * Displays the top header with ready/set/go and win/loss messages, and clickable buttons
 * for e.g., the next level.
 */
'use strict';

//var _ = require('lodash');

/**
             READY?     START >>
  Level 1    READY!    4 Players
  Level 1     SET!     4 Players
  Level 1     GO!      4 Players
      YOU WIN!     NEXT LEVEL >>
   CITY 2 BLACKED OUT!  RETRY >>
**/

var MEDIUM = 24;
var LARGE = 72;

var PRIMARY = '#FFFFFF';
var SECONDARY = '#FFD747';

// TODO: also define constants for y offsets

var CHILD_CONFIGS = {

  initial: {
    leftMessage:   { visible: false },
    centerMessage: { visible: false },
    rightMessage:  { visible: false },
    button:        { visible: false },
  },

  connecting: {
    leftMessage:   { visible: false },
    centerMessage: { text: "Connecting...", style: 'normal 400', size: MEDIUM, x: 200, y: 300 },
    rightMessage:  { visible: false },
    button:        { visible: false }
  },

  waiting: {
    leftMessage:   { visible: false },
    centerMessage: { text: "READY?", size: LARGE, style: 'italic 700', x: 240, y: 0 },
    rightMessage:  { visible: false },
    button:        { text: "START", size: MEDIUM, style: 'normal 300', x: 600, y: 30 }
  },

  // check the basecamp posting for expected visuals here...
  ready: {
    leftMessage:   { size: MEDIUM, style: 'normal 300', x: 50, y: 30 },
    centerMessage: { text: "READY!", size: LARGE, style: 'italic 700', x: 240, y: 5 },
    rightMessage:  { size: MEDIUM, style: 'normal 300', x: 600, y: 30 },
    button:        { visible: false }
  },

  set: {
    leftMessage:   { size: MEDIUM, x: 20, y: 10},
    centerMessage: { text: "SET!", size: LARGE, x: 300, y: 5 },
    rightMessage:  { size: MEDIUM, x: 500, y: 10 },
    button:        { visible: false }
  },

  go: {
    leftMessage:   { size: MEDIUM, x: 20, y: 10},
    centerMessage: { text: "GO!", size: LARGE, x: 300, y: 5 },
    rightMessage:  { size: MEDIUM, x: 500, y: 10 },
    button:        { visible: false }
  },

  won: {
    leftMessage:   { visible: false },
    centerMessage: { text: "YOU WIN!", size: LARGE, x: 50, y: 5 },
    rightMessage:  { visible: false },
    button:        { text: "NEXT LEVEL", size: MEDIUM, x: 500, y: 10 }
  },

  lost: {
    leftMessage:   { visible: false },
    centerMessage: { size: LARGE, x: 400, y: 5 },
    rightMessage:  { visible: false },
    button:        { text: "RETRY", size: MEDIUM, x: 500, y: 10 }
  }
};

// Grab the names of the child view objects ('leftMessage', etc)
var CHILD_NAMES = _.keys(CHILD_CONFIGS.waiting);

// Apply defaults to each of the child configs above (allows CHILD_CONFIGS to be concise, while
// preventing Pixi from choking on implied-but-missing data)
var CHILD_CONFIG_DEFAULTS = {
  visible: true,
  text:    "",
  size:    1,
  x:       0,
  y:       0,
  style:   'normal 400'
};

_.forEach(CHILD_CONFIGS, function(config) {
  _.forEach(config, function(childConfig) {
    _.defaults(childConfig, CHILD_CONFIG_DEFAULTS);
  });
});

// Private method bound to a HeaderBar instance by Function.prototype.bind
function click() {
  /* jshint -W040 */    // ignore apparent strict violation; 'this' will be properly bound
  if (this.onclick) {
    this.onclick();
  }
  /* jshint +W040 */
}

module.exports = function (x, y, width, height) {
  var that = this;

  this.visible = true;

  this.drawable = new PIXI.DisplayObjectContainer();
  this.drawable.x = x;
  this.drawable.y = y;
  this.drawable.width = width;
  this.drawable.height = height;

  // this doesn't change (for now)
  this.background = new PIXI.Graphics();
  this.background.beginFill(0, 0.77);
  this.background.drawRect(0, 0, width, height);
  this.background.endFill();
  this.drawable.addChild(this.background);

  this._childDrawables = {
    leftMessage: new PIXI.Text("", { fill: SECONDARY }),
    centerMessage: new PIXI.Text("", { fill: PRIMARY }),
    rightMessage: new PIXI.Text("", { fill: SECONDARY }),
    button: new PIXI.DisplayObjectContainer()
  };

  // _.forEach handily iterates over values rather than keys
  _.forEach(this._childDrawables, function(childDrawable) {
    that.drawable.addChild(childDrawable);
  });

  this._buttonTextDrawable = new PIXI.Text("", { fill: SECONDARY });
  this._childDrawables.button.addChild(this._buttonTextDrawable);

  this._childDrawables.button.interactive = true;
  this._childDrawables.button.click = this._childDrawables.button.tap = click.bind(this);
  this._childDrawables.button.buttonMode = true;

  // this._buttonGraphic = ...;
  // this._childDrawables.button.addChild(this._buttonGraphic);

  this.show('initial');
};

// The main client method. Caller specifies
//  1. configurationName corresponding to one of the keys of the CHILD_CONFIGS object.
//     (e.g., "ready", "won", etc.). This customizes the layout of the header bar without requiring
//     client code to know the details of positioning, text sizes, etc.
//
//  2. an optiona customConfiguration object. This is used to specify the text and custom visibility
//     or other property) of the message fields and button.
//
// ex:
//   headerBar.show('ready', {
//     leftMessage: { text: "Level 2" },
//     rightMessage: { text: "4 Players" }
//   });
//
// displays (with appropriate styles applied)
//
//   Level 2    READY!    4 Players
//
module.exports.prototype.show = function(configurationName, customConfiguration) {

  if ( ! CHILD_CONFIGS[configurationName] ) {
    throw new Error("HeaderBar: Unknown configuration \"" + configurationName + "\"");
  }

  // Merge the named configuration with the custom configuration.
  // Afterwards, this.leftMessage = { ... }, this.rightMessage = { ... }, etc.
  _.assign(this, _.merge(
    _.clone(CHILD_CONFIGS[configurationName], /* deep = */ true),
    _.pick(customConfiguration, CHILD_NAMES)   // avoid merging unexpected keys into 'this'!
  ));

  this.currentlyShowing = configurationName;
  this.update();
};

/**
 * Updates the graphics object
 */
module.exports.prototype.update = function() {
  this.drawable.visible = this.visible;

  _.forEach(this._childDrawables, function(drawable, key) {
    // get the PIXI.Text object, which may or may not be the drawable
    var textDrawable = key === 'button' ? this._buttonTextDrawable : drawable;
    var config = this[key];

    drawable.visible = config.visible;
    drawable.x = config.x;
    drawable.y = config.y;

    textDrawable.setText(config.text);
    textDrawable.setStyle({
      font: config.style + ' ' + config.size + 'pt "Titillium Web"',   // TODO update font
      fill: textDrawable.style.fill
    });
    console.log(config.text + ": " +  textDrawable.style.font);

  }.bind(this));
};
