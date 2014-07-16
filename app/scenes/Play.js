/*
 * A scene of active play.
 *
 */
var BarChart = require("components/BarChart"),
  FlowButton = require("components/FlowButton"),
  flow = require("core/flow");

module.exports = function (gameState, stage) {
  var i;
  this.gameState = gameState;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  stage.addChild(this.container);

  this.cityText = new PIXI.Text("", {
    font: "normal 50pt Arial"
  });
  this.container.addChild(this.cityText);

  this.statusText = new PIXI.Text("", {
    font: "normal 30pt Arial"
  });
  this.container.addChild(this.statusText);
  this.statusText.position.set(400, 0);

  this.outputBar = new BarChart(830, 50, [0, 0, 0, 0, 0], [this.gameState.ENERGY_COLOR].concat(this.gameState.CITY_COLORS).concat(this.gameState.MISSING_ENERGY_COLOR), this.gameState.MAX_ENERGY);
  this.container.addChild(this.outputBar.drawable);
  this.outputBar.drawable.position.set(12, 350);

  this.outputText = new PIXI.Text("Demand", {
    font: "normal 30pt Arial"
  });
  this.container.addChild(this.outputText);
  this.outputText.position.set(12, 350);

  this.inputBar = new BarChart(830, 50, [0, 0, 0, 0, 0], [this.gameState.ENERGY_COLOR].concat(this.gameState.CITY_COLORS).concat(this.gameState.EXTRA_ENERGY_COLOR), this.gameState.MAX_ENERGY);
  this.container.addChild(this.inputBar.drawable);
  this.inputBar.drawable.position.set(12, 1020);

  this.inputText = new PIXI.Text("Supply", {
    font: "normal 30pt Arial"
  });
  this.container.addChild(this.inputText);
  this.inputText.position.set(12, 1020);

  this.blackoutBar = new BarChart(854, 100, [0, 1], [this.gameState.MISSING_ENERGY_COLOR, 0x000000], 1);
  this.container.addChild(this.blackoutBar.drawable);
  this.blackoutBar.drawable.position.set(0, 150);
  this.blackoutBar.drawable.visible = false;

  this.blackoutText = new PIXI.Text("BLACKOUT IMMINENT", {
    font: "normal 50pt Arial",
    fill: "white"
  });
  this.container.addChild(this.blackoutText);
  this.blackoutText.position.set(0, 150);

  this.inputTypeText = new PIXI.Text("WIND", {
    font: "normal 50pt Arial"
  });
  this.container.addChild(this.inputTypeText);
  this.inputTypeText.position.set(10, 1100);
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
    this.flows[i].drawable.position.set(15 + 280 * i, 450);
    this.container.addChild(this.flows[i].drawable);
    addFlowButtonListener.call(this, this.flows[i], i);
  }
}
// Renders the scene
module.exports.prototype.render = function () {
  var elapsed = Date.now() - this.gameState.startTime,
    i, city, flowButton, totalReceived, totalSent, contract;
  if (elapsed < 0) {
    elapsed = 0;
    this.gameState.startTime -= elapsed;
  }
  // Listen to the host and stop when the host does.
  if (this.gameState.hasUpdated && this.gameState.globals.playing === false) {
    this.gameState.resetCity();
    return "join";
  }
  // Handle win
  if (elapsed >= this.gameState.WIN_AFTER) {
    if (this.gameState.host === true) {
      this.gameState.resetCity(true);
      return "join";
    }
    // Prevent any rendering/updates and wait for host to win
    return;
  }
  // Update the flows for rendering
  flow.pruneOutgoing.call(this.gameState, elapsed);
  if (this.gameState.hasUpdated) {
    //Handle lose
    if (this.gameState.host === true) {
      for (i = 0; i < this.gameState.MAX_CITIES; i++) {
        if (this.gameState.sync[i] != undefined && this.gameState.sync[i].blackout === true) {
          this.gameState.resetCity(i);
          return "join";
        }
      }
    }
    // Rendering begins!
    this.cityText.setText("City " + (this.gameState.cityId + 1));
    this.cityText.setStyle({
      font: "normal 50pt Arial",
      fill: this.gameState.CITY_COLORS[this.gameState.cityId].toString(16)
    });

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
    flowButton.update(elapsed, this.gameState);
    // Update receiving text and I/O bars
    contract = flow.getEnergyFrom.call(this.gameState, city);
    if (contract == null) {
      flowButton.receiveText.setText("");
      this.outputBar.segmentValues[city + 1] = 0;
    } else {
      totalReceived += contract.amount;
      flowButton.receiveText.setText("Receving " + contract.amount + "\n" + Math.ceil((contract.until - elapsed) / 1000) + "s left");
      this.outputBar.segmentValues[city + 1] = contract.amount;
    }
    // Update sending text and I/O bars
    contract = flow.getEnergyTo.call(this.gameState, city);
    if (contract == null) {
      flowButton.sendText.setText("Tap to\nsend 1");
      this.inputBar.segmentValues[city + 1] = 0;
    } else {
      totalSent += contract.amount;
      flowButton.sendText.setText("Sending " + contract.amount + "\n" + Math.ceil((contract.until - elapsed) / 1000) + "s left");
      this.inputBar.segmentValues[city + 1] = contract.amount;
    }
  }
  this.inputBar.update();
  this.outputBar.update();
  this.statusText.setText("Day " + Math.floor(1 + elapsed / this.gameState.DAY_LENGTH));
}
var addFlowButtonListener = function (flowButton, i) {
  var that = this;
  flowButton.drawable.click =
    flowButton.drawable.tap = function () {
      var city = i >= that.gameState.cityId ? i + 1 : i;
      flow.sendEnergy.call(that.gameState, city, 1);
  }

}
