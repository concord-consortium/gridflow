/*
 * A scene of active play.
 *
 */
var IOBar = require("components/IOBar"),
  VisualClock = require("components/VisualClock"),
  Flow = require("core/Flow"),
  Utils = require("core/Utils"),
  CityIcon = require("components/CityIcon"),
  ContractLine = require("components/ContractLine");
var addCityButtonListener, reset;
module.exports = function (gameState, stage) {
  "use strict";
  var i, cityIcon, line;
  this.gameState = gameState;
  this.flow = new Flow(gameState);
  this.lastUpdated = 0;
  this.blackoutImminent = null;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  stage.addChild(this.container);

  this.visualClock = new VisualClock(854, 1000);
  this.container.addChild(this.visualClock.drawable);

  this.cityIcon = new CityIcon();
  this.cityIcon.drawable.position.set(171, 650);
  this.cityIcon.icon.visible = true;
  this.cityIcon.iconLights.visible = true;
  this.container.addChild(this.cityIcon.drawable);

  this.statusText = new PIXI.Text("", {
    font: "normal 30pt Arial"
  });
  this.statusText.position.set(400, 10);
  this.container.addChild(this.statusText);

  this.totalInputBar = new IOBar(830, 70, this.gameState.MAX_ENERGY);
  this.container.addChild(this.totalInputBar.drawable);
  this.totalInputBar.drawable.position.set(12, 1020);

  this.inputTypes = new PIXI.DisplayObjectContainer();
  this.container.addChild(this.inputTypes);
  this.inputTypes.position.set(10, 1120);
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
    // Create and add city icon
    cityIcon = new CityIcon();
    this.cityIcons[i] = cityIcon;
    cityIcon.icon.visible = true;
    cityIcon.icon.width = cityIcon.icon.height = 265;
    cityIcon.drawable.position.set(15 + 280 * i, 50);
    this.container.addChild(cityIcon.drawable);
    addCityButtonListener.call(this, cityIcon.drawable, i);

    // Create and add contract lines
    line = new ContractLine(307 + 150 * i, 620, 185 + 280 * i, 270);
    this.contractLines[2 * i] = line;
    this.container.addChild(line.drawable);

    line = new ContractLine(125 + 280 * i, 270, 247 + 150 * i, 620);
    this.contractLines[2 * i + 1] = line;
    this.container.addChild(line.drawable);
  }
};
// Renders the scene
module.exports.prototype.render = function () {
  var elapsed, i, j, supplyIndex, estimatedTime, city, cityIcon, contractLine, contract, dayProgression, player, icon;
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
  //Handle lose for others
  if (this.gameState.hasUpdated && this.gameState.host === true) {
    for (i = 0; i < this.gameState.MAX_CITIES; i++) {
      if (this.gameState.sync[i] != undefined && this.gameState.sync[i].blackout === true) {
        this.gameState.resetCity(i);
        reset.call(this);
        return "join";
        //Repeated down below.
      }
    }
  }
  //STOP if you have a blackout.
  if (this.gameState.currentCity.blackout === true) {
    return;
  }
  //If host, update all sources/dests
  if (this.gameState.host === true && elapsed >= this.lastUpdated + this.gameState.UPDATE_INTERVAL) {
    this.lastUpdated = elapsed;
    this.gameState.dynamics.update();
    this.gameState.syncCity();
  }
  // Rendering begins!
  if (this.gameState.hasUpdated) {
    // Hmm... just in case.\
    estimatedTime = Date.now() - this.gameState.globals.elapsed;
    if (this.gameState.startTime == undefined || Math.abs(this.gameState.startTime - estimatedTime) > this.gameState.MAX_TIME_DRIFT) {
      this.gameState.startTime = estimatedTime;
    }
    // City color!
    this.cityIcon.icon.tint = this.gameState.CITY_COLORS[this.gameState.cityId];
    player = this.gameState.globals.currentLevel.players[this.gameState.cityId];
    //Update source type text
    //Shrink or grow the inputTypes children to match the current number of input types
    while (this.inputTypes.children.length > player.supply.length) {
      this.inputTypes.removeChild(this.inputTypes.children[this.inputTypes.children.length - 1]);
    }
    for (i = 0; i < player.supply.length; i++) {
      supplyIndex = this.gameState.ENERGY_SOURCE_NAMES.indexOf(player.supply[i].name);
      if (supplyIndex >= 0) {
        if (i >= this.inputTypes.children.length) {
          this.inputTypes.addChild(icon = new PIXI.Sprite(this.gameState.ENERGY_SOURCE_ICONS[supplyIndex]))
        } else {
          icon = this.inputTypes.children[i];
          icon.texture = this.gameState.ENERGY_SOURCE_ICONS[supplyIndex];
        }
        icon.tint = this.gameState.ENERGY_SOURCE_COLORS[supplyIndex];
        icon.position.x = 150 * i;
      }
    }
  }
  // Update city icons and graphs
  for (i = 0; i < this.gameState.MAX_CITIES - 1; i++) {
    city = i >= this.gameState.cityId ? i + 1 : i,
    cityIcon = this.cityIcons[i];
    if (this.gameState.sync[city] == undefined) {
      cityIcon.drawable.visible = false;
      this.contractLines[2 * i].drawable.visible = false;
      this.contractLines[2 * i + 1].drawable.visible = false;
      continue;
    }
    if (this.gameState.hasUpdated) {
      cityIcon.drawable.visible = true;
      cityIcon.icon.tint = this.gameState.CITY_COLORS[city];
    }
    //flowButton.update();
    // Update contract lines
    for (j = 0; j < 2; j++) {
      contract = j == 0 ? this.flow.send[city] : this.flow.receive[city];
      contractLine = this.contractLines[2 * i + j];
      if (this.gameState.hasUpdated) {
        contractLine.drawable.visible = true;
        contractLine.color = this.gameState.CITY_COLORS[city];
      }
      if (contract == null) {
        contractLine.active = false;
      } else {
        contractLine.active = true;
        contractLine.amount = contract.amount;
        contractLine.progress = this.gameState.globals.currentLevel.contractLength > 0 ? Utils.clamp((contract.until - elapsed) / this.gameState.globals.currentLevel.contractLength, 0, 1) : 1;
      }
      contractLine.elapsed = elapsed;
      contractLine.update();
    }
  }
  // Yum. Gotta update all those bars.
  this.totalInputBar.demand = Utils.lerp(this.totalInputBar.demand, this.flow.getTotalDemand(), this.gameState.ANIMATION_RATE);
  this.totalInputBar.supply = Utils.lerp(this.totalInputBar.supply, this.flow.supplySum, this.gameState.ANIMATION_RATE);
  this.totalInputBar.supplyRounded = Math.min(this.flow.supplySum, Math.floor(this.totalInputBar.supply + 0.1));
  this.totalInputBar.update();

  //Handle that blackout
  if (this.flow.missing > 0) {
    if (this.blackoutImminent == null) {
      this.blackoutImminent = elapsed + this.gameState.globals.currentLevel.blackoutDelay;
    }
    if (elapsed >= this.blackoutImminent && this.gameState.currentCity.blackout == false) {
      //Lost
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
    this.cityIcon.iconLights.tint = elapsed % 400 <= 200 && this.cityIcon.lightPercentage < 0.31 ? 0xFF00000 : 0xFFFFFF
    // The commented code is too performance-inefficient in canvas:
    // Utils.lerpColor(0xFFFFFF, 0xFF00000, (elapsed % 400 < 200 ? 1 : 0) * Utils.clamp(3 - 10 * this.cityIcon.lightPercentage, 0, 1));
  } else {
    this.cityIcon.lightPercentage = 1;
    this.cityIcon.iconLights.tint = 0xFFFFFF;
    this.blackoutImminent = null;
  }
  this.cityIcon.update();
  //Update day progression
  dayProgression = this.gameState.levelTimer.getDay();
  //this.statusText.setText("Day " + Math.floor(1 + dayProgression) + " - " + (Math.floor(dayProgression * 24 + 11) % 12 + 1) + ":00 " + (dayProgression % 1 < 0.5 ? "AM" : "PM"));
  this.visualClock.day = dayProgression;
  this.visualClock.update();
  this.gameState.levelTimer.unCache();
};
addCityButtonListener = function (cityButton, i) {
  var that = this;
  cityButton.click =
    cityButton.tap = function () {
      var city = i >= that.gameState.cityId ? i + 1 : i;
      that.flow.sendEnergy(city);
  };
};
reset = function () {
  this.blackoutImminent = null;
  this.lastUpdated = 0;
};
