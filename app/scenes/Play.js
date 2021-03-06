/*
 * Play.js
 * A scene of active play.
 */
'use strict';

var IOBar = require("components/IOBar"),
  Flow = require("core/Flow"),
  Utils = require("core/Utils"),
  CityIcon = require("components/CityIcon"),
  ContractLine = require("components/ContractLine"),
  EnergySourceIcon = require('components/EnergySourceIcon'),
  addCityButtonListener, reset;

var backgroundDay = PIXI.Texture.fromImage("images/background-day.png");
var backgroundNight = PIXI.Texture.fromImage("images/background-night.png");

var PLAYER_CITY_X = 236;
var PLAYER_CITY_Y = 466;
var OTHER_CITY_X = [ 49, 301, 553];
var OTHER_CITY_Y = [116, 116, 116];

var CONTRACT_LINE_X = [310, 479, 458];
var CONTRACT_LINE_Y = [204, 204, 204];

var ENERGY_SOURCE_OFFSET = {
  fossil: { x: 162, y: 589 },
  wind:   { x: 330, y: 783 },
  solar:  { x: 511, y: 660 }
};

module.exports = function (gameState, stage) {
  var i, cityIcon, line, lineIndex;
  this.gameState = gameState;
  this.flow = new Flow(gameState);
  this.lastUpdated = 0;
  this.blackoutImminent = null;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  this.background = new PIXI.Sprite(backgroundDay);
  this.container.addChild(this.background);

  stage.addChild(this.container);

  this.statusText = new PIXI.Text("", {
    font: "normal 30pt Arial"
  });
  this.statusText.position.set(400, 10);
  this.container.addChild(this.statusText);

  this.totalInputBar = new IOBar(this.gameState.MAX_ENERGY);
  this.container.addChild(this.totalInputBar.drawable);
  this.totalInputBar.drawable.position.set(37, 917);

  //  this.loseButton = new PIXI.Text("Insta-lose", {
  //    font: "normal 70pt Arial",
  //    fill: "#f00"
  //  });
  //
  //  this.container.addChild(this.loseButton);
  //  this.loseButton.position.set(200, 1000);
  //  this.loseButton.interactive = true;
  //  var that = this;
  //  this.loseButton.mousedown =
  //    this.loseButton.touchstart = function () {
  //      that.gameState.currentCity.blackout = true;
  //      that.gameState.syncCity();
  //  }

  // Setup city icons
  this.cityIcons = [null, null, null];
  // The contractLines array is interleaved: from, to, from, to, from, to.
  this.contractLines = [null, null, null, null, null, null];
  for (i = 0; i < this.gameState.MAX_CITIES - 1; i++) {

    // Create and add contract lines.
    for (var j = 0; j < 2; j++) {
      lineIndex = 2 * i + j;
      line = new ContractLine(i, j === 0 ? 'away' : 'towards');
      this.contractLines[lineIndex] = line;
      this.container.addChild(line.drawable);
      line.drawable.position.set(CONTRACT_LINE_X[i], CONTRACT_LINE_Y[i]);
      // left outer contract line is mirror image of right outer conract line
      line.drawable.scale = new PIXI.Point(i === 2 ? 1 : -1, 1);
    }

    // Create and add city icon
    cityIcon = new CityIcon();
    cityIcon.drawable.visible = true;
    cityIcon.drawable.position.set(OTHER_CITY_X[i], OTHER_CITY_Y[i]);
    this.container.addChild(cityIcon.drawable);
    addCityButtonListener.call(this, cityIcon.drawable, i);
    cityIcon.largeOrSmall = 'small';
    this.cityIcons[i] = cityIcon;
  }

  // City icon goes in front of contract lines
  this.cityIcon = new CityIcon();
  this.cityIcon.drawable.position.set(PLAYER_CITY_X, PLAYER_CITY_Y);
  this.cityIcon.drawable.visible = true;
  this.container.addChild(this.cityIcon.drawable);

  this.energySourceIcons = {};

  // Energy source icons go in front of city icons
  this.gameState.ENERGY_SOURCE_NAMES.forEach(function(type) {
    var drawable;
    this.energySourceIcons[type] = new EnergySourceIcon(type);
    drawable = this.energySourceIcons[type].drawable;
    this.container.addChild(drawable);
    drawable.x = ENERGY_SOURCE_OFFSET[type].x;
    drawable.y = ENERGY_SOURCE_OFFSET[type].y;
  }.bind(this));
};

// Renders the scene
module.exports.prototype.render = function () {
  var i, j, supplyIndex,
    elapsed, estimatedTime, dayProgression,
    city, cityIcon, icon,
    contractLine, contract,
    nextColor,
    player;
  var contractLength;

  this.gameState.levelTimer.cache();
  elapsed = this.gameState.levelTimer.getElapsed();
  // Listen to the host and stop when the host does.
  if (this.gameState.hasUpdated && this.gameState.globals.playing === false) {
    this.gameState.resetCity();
    reset.call(this);
    return "join";
  }
  // Handle win
  if (this.gameState.globals.currentLevel.winAfter >= 0 && elapsed >= this.gameState.globals.currentLevel.winAfter) {
    if (this.gameState.host === true) {
      this.gameState.resetCity(true);
      reset.call(this);
      return "join";
    }
    // Prevent any rendering/updates and wait for host to win
    return;
  }
  // Update flow for rendering
  this.flow.pruneOutgoing();
  this.flow.computeFlow();
  // Handle lose for others
  if (this.gameState.hasUpdated && this.gameState.host === true) {
    for (i = 0; i < this.gameState.MAX_CITIES; i++) {
      if (this.gameState.sync[i] != undefined && this.gameState.sync[i].blackout === true) {
        this.gameState.resetCity(i);
        reset.call(this);
        return "join";
        // Repeated down below.
      }
    }
  }
  // STOP if you have a blackout.
  if (this.gameState.currentCity.blackout === true) {
    return;
  }
  // If host, update all sources/dests
  if (this.gameState.host === true && elapsed >= this.lastUpdated + this.gameState.UPDATE_INTERVAL) {
    this.lastUpdated = elapsed;
    this.gameState.dynamics.update();
    this.gameState.syncCity();
  }
  // Rendering begins!
  if (this.gameState.hasUpdated) {
    // Hmm... just in case.
    estimatedTime = Date.now() - this.gameState.globals.elapsed;
    if (this.gameState.startTime == undefined || Math.abs(this.gameState.startTime - estimatedTime) > this.gameState.MAX_TIME_DRIFT) {
      this.gameState.startTime = estimatedTime;
    }
    // City color!
    this.cityIcon.cityIndex = this.gameState.cityId;
    player = this.gameState.globals.currentLevel.players[this.gameState.cityId];

    // Update energy source icons (update visibility, and animate)
    var supplyTypes = _.pluck(player.supply, 'name');
    Object.keys(this.energySourceIcons).forEach(function(type) {
      var esi = this.energySourceIcons[type];
      esi.visible = supplyTypes.indexOf(esi.type) >= 0;
    }.bind(this));
  }

  // Update day progression
  this.isDaytime = this.gameState.levelTimer.isDaytime();
  setBackground.call(this);

  // Every animation step, update energySourceIcons
  Object.keys(this.energySourceIcons).forEach(function(type) {
    if (type == 'solar') {
      this.energySourceIcons[type].stopped = ! this.isDaytime;
    }
    this.energySourceIcons[type].update();

  }.bind(this));

  // Update city icons and graphs
  for (i = 0; i < this.gameState.MAX_CITIES - 1; i++) {
    city = i >= this.gameState.cityId ? i + 1 : i;
    cityIcon = this.cityIcons[i];
    if (this.gameState.sync[city] == undefined) {
      cityIcon.drawable.visible = false;
      this.contractLines[2 * i].drawable.visible = false;
      this.contractLines[2 * i + 1].drawable.visible = false;
    } else {
      if (this.gameState.hasUpdated) {
        cityIcon.drawable.visible = true;
        cityIcon.cityIndex = city;
      }
      // Update contract lines
      for (j = 0; j < 2; j++) {
        contract = j == 0 ? this.flow.send[city] : this.flow.receive[city];
        contractLine = this.contractLines[2 * i + j];
        if (this.gameState.hasUpdated) {
          contractLine.drawable.visible = true;
        }
        if (contract == null) {
          contractLine.hasContract = false;
        } else if (! contractLine.hasContract ) {
          contractLine.contractStart = elapsed;
          contractLine.hasContract = true;
          contractLine.contractLength = this.gameState.globals.currentLevel.contractLength;
        }
        contractLine.elapsed = elapsed;
        contractLine.update();
      }
    }
    cityIcon.update();
  }
  // Yum. Gotta update all those bars.
  this.totalInputBar.demand = Utils.lerp(this.totalInputBar.demand, this.flow.getTotalDemand(), this.gameState.ANIMATION_RATE);
  this.totalInputBar.supply = Utils.lerp(this.totalInputBar.supply, this.flow.supplySum, this.gameState.ANIMATION_RATE);
  this.totalInputBar.update();

  // Handle that blackout
  if (this.flow.missing > 0) {
    if (this.blackoutImminent == null) {
      this.blackoutImminent = elapsed + this.gameState.globals.currentLevel.blackoutDelay;
    }
    if (elapsed >= this.blackoutImminent && this.gameState.currentCity.blackout == false) {
      // Lost
      this.gameState.currentCity.blackout = true;
      this.blackoutImminent = null;
      if (this.gameState.host === true) {
        this.gameState.resetCity(0);
        reset.call(this);
        return "join";
      } else {
        this.gameState.syncCity();
      }
    }
    this.cityIcon.lightPercentage = Utils.clamp((this.blackoutImminent - elapsed) / this.gameState.globals.currentLevel.blackoutDelay, 0, 1);


    // TODO: reinstate some form of blinking? This is what was used prior to the new artwork:
    // nextColor = elapsed % this.gameState.BLACKOUT_BLINK <= this.gameState.BLACKOUT_BLINK / 2 && this.cityIcon.lightPercentage < 0.31 ? 0xFF0000 : 0xFFFFFF;
    // if (nextColor === 0xFF0000 && this.cityIcon.iconLights.tint === 0xFFFFFF) {
    //   Utils.vibrate(this.gameState.BLACKOUT_VIBRATION);
    // }
    // this.cityIcon.iconLights.tint = nextColor;

    // The commented code is too performance-inefficient in canvas:
    // Utils.lerpColor(0xFFFFFF, 0xFF00000, (elapsed % 400 < 200 ? 1 : 0) * Utils.clamp(3 - 10 * this.cityIcon.lightPercentage, 0, 1));

  } else {
    this.cityIcon.lightPercentage = 1;
    this.blackoutImminent = null;
  }
  this.cityIcon.update();
  this.gameState.levelTimer.unCache();
};

function setBackground(dayProgression) {
  // jshint -W040
  this.background.setTexture(this.isDaytime ? backgroundDay : backgroundNight);
  // jshint +W040
}

addCityButtonListener = function (cityButton, i) {
  var that = this;
  cityButton.click =
    cityButton.tap = function () {
      if (that.gameState.globals.playing === true) {
        that.flow.sendEnergy(i >= that.gameState.cityId ? i + 1 : i);
        Utils.vibrate(that.gameState.TAP_VIBRATION);
      }
  };
  cityButton.mousedown =
    cityButton.touchstart = function () {
      if (that.gameState.globals.playing === true) {
        Utils.vibrate(that.gameState.TAP_VIBRATION);
      }
  };
};
reset = function () {
  this.blackoutImminent = null;
  this.lastUpdated = 0;
};
