/*
 * Join.js
 * A scene where the user is waiting for others to join.
 */
module.exports = function (gameState, stage) {
  this.gameState = gameState;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  stage.addChild(this.container);

  this.blackoutRectangle = new PIXI.Graphics();
  this.container.addChild(this.blackoutRectangle);

  this.cityText = new PIXI.Text("", {
    font: "normal 50pt Arial",
    fill: "525252"
  });
  this.container.addChild(this.cityText);

  this.statusText = new PIXI.Text("", {
    font: "normal 30pt Arial",
    fill: "525252"
  });
  this.container.addChild(this.statusText);
  this.statusText.position.set(400, 0);

  this.placeholderText = new PIXI.Text("INSERT COOL PAIRING\nSCREEN HERE", {
    font: "normal 50pt Arial",
    fill: "525252"
  });
  this.container.addChild(this.placeholderText);
  this.placeholderText.position.set(10, 500);

  this.readyButton = new PIXI.Text("READY", {
    font: "normal 100pt Arial",
    fill: "525252"
  });
  this.container.addChild(this.readyButton);
  this.readyButton.position.set(200, 1000);
  this.readyButton.interactive = true;
  var that = this;
  this.readyButton.mousedown =
    this.readyButton.touchstart = function () {
      that.readyButton.setStyle({
        font: "normal 100pt Arial",
        fill: "green"
      });
      if (that.gameState.currentCity != undefined) {
        that.gameState.currentCity.ready = true;
        that.gameState.syncCity();
      }
  }
  this.readyButton.mouseup =
    this.readyButton.touchend =
    this.readyButton.mouseout = function () {
      that.readyButton.setStyle({
        font: "normal 100pt Arial",
        fill: "#525252"
      });
      if (that.gameState.currentCity != undefined) {
        that.gameState.currentCity.ready = false;
        that.gameState.syncCity();
      }
  }
}
// Renders the scene
module.exports.prototype.render = function () {
  "use strict";
  if (this.gameState.hasUpdated) {
    // Start the game if everyone is ready
    var ready = 0,
      total = this.gameState.countCities(),
      i;
    for (i = 0; i < this.gameState.MAX_CITIES; i++) {
      if (this.gameState.sync[i] != undefined && this.gameState.sync[i].ready === true) {
        ready++;
      }
    }
    if (this.gameState.host === true) {
      if (ready >= total) {
        if (this.gameState.globals.startTime == null) {
          this.gameState.globals.startTime = Date.now() + 500;
          this.gameState.syncCity();
        }
      } else if (this.gameState.globals.startTime != null) {
        this.gameState.globals.startTime = null;
        this.gameState.syncCity();
      }
    }
    // Otherwise, continue rendering
    this.cityText.setText(this.gameState.cityId == undefined ? "" : "City " + (this.gameState.cityId + 1));
    this.statusText.setText(this.gameState.cityId == undefined ? "Connecting..." : ready + "/" + total + " Player(s) ready");
    if (this.gameState.status != null) {
      if (this.gameState.status === true) {
        this.blackoutRectangle.clear();
        this.placeholderText.setText("YOU WIN!!!!!")
      } else {
        this.blackoutRectangle.beginFill(0x000000);
        this.blackoutRectangle.drawRect(0, 0, 854, 1280);
        this.blackoutRectangle.endFill();
        this.placeholderText.setText("City " + (this.gameState.status + 1) + " BLACKED OUT.");
      }
      this.readyButton.setText("AGAIN");
      this.gameState.status = null;
    }
  }
  if (this.gameState.globals && this.gameState.globals.startTime != null && Date.now() >= this.gameState.globals.startTime) {
    return "play";
  }
};
