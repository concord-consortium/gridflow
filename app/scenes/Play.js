/*
 * A scene of active play.
 *
 */
var BarChart = require("components/BarChart"),
  IOBar = require("components/IOBar"),
  FlowButton = require("components/FlowButton"),
  VisualClock = require("components/VisualClock"),
  Flow = require("core/Flow"),
  Utils = require("core/Utils");
var addFlowButtonListener, reset;
module.exports = function (gameState, stage) {
  var i;
  this.gameState = gameState;
  this.flow = new Flow(gameState);
  this.lastUpdated = 0;
  this.blackoutImminent = null;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  stage.addChild(this.container);

  this.cityBackground = new VisualClock(854, 160);
  this.container.addChild(this.cityBackground.drawable);

  this.statusText = new PIXI.Text("", {
    font: "normal 30pt Arial"
  });
  this.statusText.position.set(400, 100);
  this.container.addChild(this.statusText);

  this.totalInputBar = new IOBar(830, 70, this.gameState.MAX_ENERGY);
  this.container.addChild(this.totalInputBar.drawable);
  this.totalInputBar.drawable.position.set(12, 1000);

  this.blackoutBar = new BarChart(854, 100, [0, 1], [this.gameState.MISSING_ENERGY_COLOR, 0x000000], 1);
  this.container.addChild(this.blackoutBar.drawable);
  this.blackoutBar.drawable.position.set(0, 200);
  this.blackoutBar.drawable.visible = false;

  this.blackoutText = new PIXI.Text("BLACKOUT IMMINENT", {
    font: "normal 50pt Arial",
    fill: "white"
  });
  this.container.addChild(this.blackoutText);
  this.blackoutText.position.set(0, 200);

  this.inputTypeText = new PIXI.Text("", {
    font: "normal 50pt Arial"
  });
  this.container.addChild(this.inputTypeText);
  this.inputTypeText.position.set(10, 1150);
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

  // Flows are the buttons that symbolize each city and it's energy flow.
  this.flows = [null, null, null];
  for (i = 0; i < this.gameState.MAX_CITIES - 1; i++) {
    this.flows[i] = new FlowButton(265, 500, i + 1, this.gameState.CITY_COLORS[i]);
    this.flows[i].drawable.position.set(15 + 280 * i, 350);
    this.container.addChild(this.flows[i].drawable);
    addFlowButtonListener.call(this, this.flows[i], i);
  }
}
// Renders the scene
module.exports.prototype.render = function () {
  var elapsed, i, city, flowButton, contract, dayProgression, text, player;
  this.gameState.levelTimer.cache();
  elapsed = this.gameState.levelTimer.getElapsed();
  // Listen to the host and stop when the host does.
  if (this.gameState.hasUpdated && this.gameState.globals.playing === false) {
    this.gameState.resetCity();
    reset.call(this);
    return "join";
  }
  // Handle win
  if (elapsed >= this.gameState.globals.currentLevel.winAfter) {
    if (this.gameState.host === true) {
      this.gameState.resetCity(true);
      reset.call(this);
      return "join";
    }
    // Prevent any rendering/updates and wait for host to win
    return;
  }
  // Update the flows for rendering
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
    i = "City " + (this.gameState.cityId + 1);
    player = this.gameState.globals.currentLevel.players[this.gameState.cityId]
    //Update source type text
    text = "";
    for (i = 0; i < player.supply.length; i++) {
      if (text.length > 0) {
        text += ", ";
      }
      text += player.supply[i].name;
    }
    this.inputTypeText.setText(text);
  }
  // Update flows and graphs
  for (i = 0; i < this.gameState.MAX_CITIES - 1; i++) {
    city = i >= this.gameState.cityId ? i + 1 : i,
    flowButton = this.flows[i];
    if (this.gameState.sync[city] == undefined) {
      flowButton.drawable.visible = false;
      continue;
    }
    if (this.gameState.hasUpdated) {
      flowButton.drawable.visible = true;
      flowButton.setLabel(city + 1);
      flowButton.color = this.gameState.CITY_COLORS[city];
    }
    flowButton.update(this.gameState);
    // Update receiving text and I/O bars
    contract = this.flow.receive[city];
    if (contract == null) {
      flowButton.receiveText.setText("");
    } else {
      flowButton.receiveText.setText("Receiving " + contract.amount + (this.gameState.globals.currentLevel.dayLength > 0 ? "\n" + Math.ceil(24 * (contract.until - elapsed) / this.gameState.globals.currentLevel.dayLength) + "h left" : this.gameState.globals.currentLevel.contractLength > 0 ? "\n" + Math.ceil((contract.until - elapsed) / 1000) + "s" : ""));
    }
    // Update sending text and I/O bars
    contract = this.flow.send[city];
    if (contract == null) {
      flowButton.sendText.setText("Tap to\nsend");
    } else {
      flowButton.sendText.setText("Sending " + contract.amount + (this.gameState.globals.currentLevel.dayLength > 0 ? "\n" + Math.ceil(24 * (contract.until - elapsed) / this.gameState.globals.currentLevel.dayLength) + "h left" : this.gameState.globals.currentLevel.contractLength > 0 ? "\n" + Math.ceil((contract.until - elapsed) / 1000) + "s" : ""));
    }
  }
  // Yum. Gotta update all those bars.
  this.totalInputBar.demand = Utils.lerp(this.totalInputBar.demand, this.flow.getTotalDemand(), this.gameState.ANIMATION_RATE);
  this.totalInputBar.supply = Utils.lerp(this.totalInputBar.supply, this.flow.supplySum, this.gameState.ANIMATION_RATE);

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
    this.blackoutBar.drawable.visible = true;
    this.blackoutBar.segmentValues[1] = Math.max(0, (this.blackoutImminent - elapsed) / this.gameState.globals.currentLevel.blackoutDelay);
    this.blackoutBar.segmentValues[0] = 1 - this.blackoutBar.segmentValues[1];
    this.blackoutBar.update();
  } else {
    this.blackoutImminent = null;
    this.blackoutBar.drawable.visible = false;
  }

  //Update day text
  dayProgression = this.gameState.levelTimer.getDay();
  this.statusText.setText("Day " + Math.floor(1 + dayProgression) + " - " + (Math.floor(dayProgression * 24 + 11) % 12 + 1) + ":00 " + (dayProgression % 1 < 0.5 ? "AM" : "PM"));
  this.cityBackground.day = dayProgression;
  this.cityBackground.update();
  this.gameState.levelTimer.unCache();
}
addFlowButtonListener = function (flowButton, i) {
  var that = this;
  flowButton.drawable.click =
    flowButton.drawable.tap = function () {
      var city = i >= that.gameState.cityId ? i + 1 : i;
      that.flow.sendEnergy(city);
  }
}
reset = function () {
  this.blackoutImminent = null;
  this.lastUpdated = 0;
}
