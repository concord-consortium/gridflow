/*
 * Join.js
 * A scene where the user is waiting for others to join.
 */
var CityIcon = require("components/CityIcon");

module.exports = function (gameState, stage) {
  "use strict";
  this.gameState = gameState;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  stage.addChild(this.container);

  this.blackoutRectangle = new PIXI.Graphics();
  this.container.addChild(this.blackoutRectangle);

  this.cityIcon = new CityIcon();
  this.cityIcon.drawable.position.set(171, 650);
  this.cityIcon.iconBorder.visible = true;

  this.statusText = new PIXI.Text("", {
    font: "normal 40pt Arial",
    fill: "#525252"
  });
  this.statusText.position.set(10, 10);
  this.container.addChild(this.statusText);

  this.placeholderText = new PIXI.Text("", {
    font: "normal 50pt Arial",
    fill: "#525252"
  });
  this.container.addChild(this.placeholderText);
  this.placeholderText.position.set(10, 120);

  this.readyButton = new PIXI.Text("READY", {
    font: "normal 100pt Arial",
    fill: "#525252"
  });
  this.readyButton.visible = false;
  this.readyButton.position.set(200, 1000);

  this.readyContainer = new PIXI.DisplayObjectContainer();
  this.readyContainer.interactive = true;
  this.readyContainer.addChild(this.readyButton);
  this.readyContainer.addChild(this.cityIcon.drawable);
  this.container.addChild(this.readyContainer);

  var that = this;
  this.readyContainer.mousedown =
    this.readyContainer.touchstart = function () {
      if (that.gameState.currentCity != undefined && that.gameState.globals != undefined) {
        that.gameState.currentCity.ready = true;
        that.gameState.syncCity();
      }
  };
  this.readyContainer.mouseup =
    this.readyContainer.touchend =
    this.readyContainer.mouseout = function () {
      if (that.gameState.currentCity != undefined && that.gameState.globals != undefined) {
        that.gameState.currentCity.ready = false;
        that.gameState.syncCity();
      }
  };
};
// Renders the scene
module.exports.prototype.render = function () {
  "use strict";
  if (this.gameState.hasUpdated) {
    var ready = 0,
      total = this.gameState.countCities(),
      i;
    for (i = 0; i < this.gameState.MAX_CITIES; i++) {
      if (this.gameState.sync[i] != undefined && this.gameState.sync[i].ready === true) {
        ready++;
      }
    }
    if (this.gameState.host === true) {
      if (ready >= total && total >= 2) {
        if (this.gameState.globals.playing === false) {
          this.gameState.globals.playing = true;
          this.gameState.globals.status = null;
          this.gameState.globals.startTime = Date.now();
          this.gameState.syncCity();
        }
      }
    }
    // Start the game if everyone is ready
    if (this.gameState.globals != undefined &&
      this.gameState.globals.playing === true &&
      this.gameState.currentCity != undefined &&
      this.gameState.currentCity.ready === true) {
      this.gameState.startTime = Date.now() - this.gameState.globals.elapsed;
      return "play";
    }
    // Otherwise, continue rendering
    if (this.gameState.cityId != undefined) {
      this.readyButton.visible = true;
      this.cityIcon.iconBorder.tint = this.gameState.CITY_COLORS[this.gameState.cityId];
      this.cityIcon.icon.tint = this.gameState.CITY_COLORS[this.gameState.cityId];
    }
    //this.statusText.setText(this.gameState.cityId == undefined || this.gameState.globals == undefined ? "Connecting..." : ready + "/" + total + " Player(s) ready\nLevel " + (this.gameState.globals.level + 1));
    this.statusText.setText(this.gameState.cityId == undefined || this.gameState.globals == undefined ? "Connecting..." : "Level " + (this.gameState.globals.level + 1) + " with " + total + " player" + (total === 1 ? "" : "s"));

    if (this.gameState.globals != undefined && this.gameState.globals.status != null) {
      this.blackoutRectangle.clear();
      if (this.gameState.globals.status === true) {
        // Default, white background
        this.blackoutRectangle.beginFill(0xFFFFFF, 0.9);
      } else {
        // Blackout
        this.blackoutRectangle.beginFill(0x000000, 0.5);
      }
      this.blackoutRectangle.drawRect(0, 0, 854, 1280);
      this.blackoutRectangle.endFill();
      if (this.gameState.globals.status === true) {
        this.placeholderText.setText("YOU WIN!!!!!");
        this.placeholderText.setStyle({
          font: "normal 50pt Arial",
          fill: "#0fb45c"
        });
        this.readyButton.setText("NEXT");
      } else {
        this.placeholderText.setText("City " + (this.gameState.globals.status + 1) + " BLACKED OUT.");
        this.placeholderText.setStyle({
          font: "normal 50pt Arial",
          fill: "#" + this.gameState.CITY_COLORS[this.gameState.globals.status].toString(16)
        });
        this.readyButton.setText("RETRY");
      }
    }
  }
  if (this.gameState.currentCity != undefined) {
    // Reactive readiness
    this.readyButton.setStyle({
      font: "normal 100pt Arial",
      fill: this.gameState.currentCity.ready ? "#c7c7c7" : "#525252"
    });
    this.cityIcon.icon.visible = this.gameState.currentCity.ready;
  }
};
