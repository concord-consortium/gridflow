/*
 * Join.js
 * A scene where the user is waiting for others to join.
 */
'use strict';

var Utils     = require('core/Utils');
var HeaderBar = require('components/HeaderBar');

var COUNTDOWN_INTERVAL = 1000;  // ms
var CITY_COLORS = ["green", "orange", "blue", "red"];

function setCountdownStep(step) {
  // jshint -W040
  this.gameState.globals.countdownStep = step;
  this.gameState.syncCity();
  // jshint +W040
}

module.exports = function (gameState, stage) {
  var background = new PIXI.Sprite.fromImage('images/background-grey.png');
  this.introMessage = new PIXI.Sprite.fromImage('images/intro-message.png');

  background.position.x = background.position.y = 0;

  this.gameState = gameState;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  this.container.addChild(background);
  this.container.addChild(this.introMessage);
  stage.addChild(this.container);

  this.headerBar = new HeaderBar(0, 0, 768, 105);
  this.container.addChild(this.headerBar.drawable);

  this.headerBar.onclick = function() {
    // TODO: and what to do if there is no current city?
    if (this.gameState.currentCity && this.gameState.globals) {
      this.gameState.currentCity.ready = true;
      Utils.vibrate(this.gameState.TAP_VIBRATION);
      this.gameState.syncCity();
    }
  }.bind(this);
};

// Renders the scene
module.exports.prototype.render = function () {

  if ( ! this.gameState.hasUpdated) {
    return;
  }

  var gameState = this.gameState;
  var globals   = this.gameState.globals;
  var ready = 0;
  var total = this.gameState.countCities();
  var i;

  this.introMessage.visible = false;

  // Host decides when we're ready to start playing
  if (this.gameState.host) {
    // TODO make this a method?
    for (i = 0; i < this.gameState.MAX_CITIES; i++) {
      if (gameState.sync[i] && gameState.sync[i].ready) {
        ready++;
      }
    }

    if (ready >= total && total >= 2) {
      // start the countdown and then play
      if ( ! (this.gameState.globals.countdownStep || this.gameState.globals.playing) ) {
        setCountdownStep.call(this, 'ready');
        window.setTimeout(setCountdownStep.bind(this, 'set'),     COUNTDOWN_INTERVAL);
        window.setTimeout(setCountdownStep.bind(this, 'go'),  2 * COUNTDOWN_INTERVAL);
        window.setTimeout(function() {
          this.gameState.countdownStep = false;
          this.gameState.globals.playing = true;
          this.gameState.globals.status = null;
          this.gameState.globals.startTime = Date.now();
          this.gameState.syncCity();
        }.bind(this), 3 * COUNTDOWN_INTERVAL);
      }
    }
  }

  // Stop and go to 'play' scene if the host has set playing=true
  if (globals && globals.playing && gameState.currentCity && gameState.currentCity.ready) {
    gameState.startTime = Date.now() - globals.elapsed;
    return 'play';
  }

  // show connecting message?
  if (this.gameState.cityId == null || this.gameState.globals == null) {
    this.headerBar.show('connecting');
    this.introMessage.visible = true;
    return;
  }

  // show ready, set, or go?
  if (gameState.currentCity.ready) {
    this.headerBar.show(globals.countdownStep || 'ready', {
      leftMessage: { text: "LEVEL " + (this.gameState.globals.level + 1) },
      rightMessage: { text:  total + " PLAYER" + (total === 1 ? "" : "S") }
    });
    return;
  }

  // show won/lost message?
  if (globals && globals.status != null) {
    // can't test truthiness; status === true means won, status === 1 means city 2 blacked out...
    if (globals.status === true) {
      this.headerBar.show('won');
    } else {
      this.headerBar.show('lost', {
        centerMessage: { text: CITY_COLORS[globals.status].toUpperCase() + " BLACKED OUT!" }
      });
    }
    return;
  }

  // wait
  this.headerBar.show('waiting');
  this.introMessage.visible = true;
};
