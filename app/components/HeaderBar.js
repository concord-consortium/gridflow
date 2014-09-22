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

// text colors
var PRIMARY = '#FFFFFF';
var SECONDARY = '#FFD747';

var SMALL = 22;
var MEDIUM = 36;
var LARGE = 72;

var Y_LARGE = 124;
var Y_SMALL = 75;
var RSG_LEFT  = { size: SMALL, style: 'normal 600', x: 48,  y: Y_SMALL };
var RSG_RIGHT = { size: SMALL, style: 'normal 600', x: 586, y: Y_SMALL };

var CHILD_CONFIGS = {

  initial: {
    leftMessage:   { visible: false },
    centerMessage: { visible: false },
    rightMessage:  { visible: false },
    button:        { visible: false },
  },

  connecting: {
    leftMessage:   { visible: false },
    // TODO
    centerMessage: { text: "Connecting...", style: 'normal 400', size: SMALL, x: 200, y: Y_SMALL },
    rightMessage:  { visible: false },
    button:        { visible: false }
  },

  waiting: {
    leftMessage:   { visible: false },
    centerMessage: { text: "READY?", size: LARGE, style: 'italic 700', x: 240, y: Y_LARGE },
    rightMessage:  { visible: false },
    button:        { text: "START", size: SMALL, style: 'normal 600', x: 85, y: Y_SMALL }
  },

  ready: {
    leftMessage:   RSG_LEFT,
    centerMessage: { text: "READY!", size: LARGE, style: 'italic 700', x: 240, y: Y_LARGE },
    rightMessage:  RSG_RIGHT,
    button:        { visible: false }
  },

  set: {
    leftMessage:   RSG_LEFT,
    centerMessage: { text: "SET!", size: LARGE, style: 'italic 700', x: 297, y: Y_LARGE },
    rightMessage:  RSG_RIGHT,
    button:        { visible: false }
  },

  go: {
    leftMessage:   RSG_LEFT,
    centerMessage: { text: "GO!", size: LARGE, style: 'italic 700', x: 319, y: Y_LARGE },
    rightMessage:  RSG_RIGHT,
    button:        { visible: false }
  },

  won: {
    leftMessage:   { visible: false },
    centerMessage: { text: "YOU WIN!", size: MEDIUM, x: 300, y: 85 },
    rightMessage:  { visible: false },
    button:        { text: "NEXT LEVEL", size: SMALL, style: 'normal 600', x: 16, y: Y_SMALL }
  },

  lost: {
    leftMessage:   { visible: false },
    centerMessage: { size: MEDIUM, x: 80, y: 85 },
    rightMessage:  { visible: false },
    button:        { text: "RETRY", size: SMALL, style: 'normal 600', x: 85, y: Y_SMALL }
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

function makeButtonGraphic() {
  var WIDTH = 21;
  var HEIGHT = 38;

  var button = new PIXI.Graphics();
  // TODO: this is SECONDARY, but can't use CSS style string
  button.beginFill(0xFFD747);
  button.moveTo(0, 0);
  button.lineTo(WIDTH, HEIGHT / 2);
  button.lineTo(0, HEIGHT);
  button.lineTo(0, 0);
  button.endFill();

  return button;
};

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

  // TODO: make the math work
  this._childDrawables.button.position.x = 540;
  this._childDrawables.button.hitArea = new PIXI.Rectangle(0, 0, 228, 105);

  // Make the y-coordinate of PIXI.Text objects the bottom (.anchor.y = 1) because PIXI seems
  // to get confused about the proper bounding box, making it impossible (using the default top
  // anchor) to put text elements high enough on the screen even when their y coordinate is set to 0
  _.forEach(this._childDrawables, function(childDrawable) {
    if (childDrawable.anchor) {
      childDrawable.anchor.y = 1;
    }
    that.drawable.addChild(childDrawable);
  });

  this._buttonTextDrawable = new PIXI.Text("", { fill: SECONDARY });
  this._buttonTextDrawable.anchor.y = 1;
  this._childDrawables.button.addChild(this._buttonTextDrawable);

  this._buttonGraphic = makeButtonGraphic();
  this._buttonGraphic.position.x = 179;
  this._buttonGraphic.position.y = 34;
  this._childDrawables.button.addChild(this._buttonGraphic);

  this._childDrawables.button.interactive = true;
  this._childDrawables.button.click = this._childDrawables.button.tap = click.bind(this);
  this._childDrawables.button.buttonMode = true;

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
    textDrawable.x = config.x;
    textDrawable.y = config.y;
    // hacks to deal with Canvas/PIXI/Titillium kerning and space issues:
    // (1) add 1 space to end of strings deal with the too-small bounding box for italic fonts
    // (2) add 1 space before exclamation points, to deal with terrible default kerning
    textDrawable.setText(config.text.replace(/!$/, " !") + " ");
    textDrawable.setStyle({
      font: config.style + ' ' + config.size + 'pt "Titillium Web"',   // TODO update font
      fill: textDrawable.style.fill
    });

  }.bind(this));
};
