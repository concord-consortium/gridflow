var BarChart = require("components/BarChart"),
    GameState = require("GameState"),
    Wait = require("scenes/Join"),
    Play = require("scenes/Play"),
    animate;


var gameState = new GameState(),
    renderer = new PIXI.autoDetectRenderer(854, 1280);

gameState.islandName = "testland";
gameState.connect();
gameState.currentStage = Wait;

document.body.appendChild(renderer.view);

//var chart1=new BarChart(500, 20, [1,2,3], [0xFF0000, 0x00FF00, 0x0000FF],7);
//chart1.update();
//.addChild(chart1.drawable);

animate = function () {
  "use strict";
  gameState.currentStage.render(gameState);
  gameState.hasUpdated = false;
  renderer.render(gameState.currentStage.stage);
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);