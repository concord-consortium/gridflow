/*
 * Wait.js
 * A scene where the user is waiting for others to join.
 */
module.exports.stage = new PIXI.Stage(0xFFFFFF);

module.exports.statusText = new PIXI.Text("");
module.exports.stage.addChild(module.exports.statusText);

/**
 * Renders the scene
 */
module.exports.render = function (gameState) {
  "use strict";
  if (gameState.hasUpdated) {
    module.exports.statusText.setText(gameState.cityId === null?"Connecting..." : "City "+(gameState.cityId + 1)+"\n"+gameState.countCities() + " Player(s) connected");
  }
};