/*
 * A scene of active play.
 *
 */
module.exports = function (gameState, stage) {
  this.gameState = gameState;

  this.container = new PIXI.DisplayObjectContainer();
  this.container.visible = false;
  stage.addChild(this.container);

  this.cityText = new PIXI.Text("",{
    font: "normal 50pt Arial"
  });
  this.container.addChild(this.cityText);

  this.statusText = new PIXI.Text("",{
    font: "normal 30pt Arial"
  });
  this.container.addChild(this.statusText);
  this.statusText.position.set(400,0);

}
// Renders the scene
module.exports.prototype.render = function () {
  var elapsed = Date.now() - this.gameState.globals.startTime;
  if(elapsed >= this.gameState.WIN_AFTER){
    this.gameState.status = true;
    if(this.gameState.host === true){
      this.gameState.globals.startTime = null;
      this.gameState.syncCity();
    }
    return "join";
  }
  if(this.gameState.hasUpdated){
    if(this.gameState.globals.startTime == null){
      // TODO: Clean it out!
      return "join";
    }
    this.cityText.setText("City " + (this.gameState.cityId + 1));
  }
  this.statusText.setText("Day "+Math.floor(1+elapsed/this.gameState.DAY_LENGTH));
}
