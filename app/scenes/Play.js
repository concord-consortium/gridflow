/*
 * A scene of active play.
 *
 */
module.exports = function (gameState, stage) {
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

  this.loseButton = new PIXI.Text("Insta-lose", {
    font: "normal 70pt Arial",
    fill: "#f00"
  });
  this.container.addChild(this.loseButton);
  this.loseButton.position.set(200, 1000);
  this.loseButton.interactive = true;
  var that = this;
  this.loseButton.mousedown =
    this.loseButton.touchstart = function () {
      that.gameState.currentCity.blackout = true;
      that.gameState.syncCity();
  }
}
// Renders the scene
module.exports.prototype.render = function () {
  var elapsed = Date.now() - this.gameState.startTime,
    i;
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
  }
  this.statusText.setText("Day " + Math.floor(1 + elapsed / this.gameState.DAY_LENGTH));
}
