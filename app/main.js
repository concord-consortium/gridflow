var GameState = require("core/GameState"),
  Join = require("scenes/Join"),
  Play = require("scenes/Play");


var gameState = new GameState(),
  renderer = new PIXI.autoDetectRenderer(854, 1280),
  stage = new PIXI.Stage(0xFFFFFF),
  stages = {
    play: new Play(gameState, stage),
    join: new Join(gameState, stage)
  },
  animate;
stage.interactive = true;

gameState.connect(window.location.hash.replace(/[^a-z]+/g, "") || "default");
gameState.currentStage = stages.join;
gameState.currentStage.container.visible = true;

document.body.appendChild(renderer.view);

//var chart1=new BarChart(500, 20, [1,2,3], [0xFF0000, 0x00FF00, 0x0000FF],7);
//chart1.update();
//.addChild(chart1.drawable);

animate = function () {
  "use strict";
  var switchTo = gameState.currentStage.render();
  if (switchTo != undefined) {
    // Keep the game visible underneath
    if (switchTo != "join") {
      gameState.currentStage.container.visible = false;
    }
    gameState.currentStage = stages[switchTo];
    gameState.currentStage.container.visible = true;
    gameState.currentStage.render();
    gameState.hasUpdated = true;
  } else {
    gameState.hasUpdated = false;
  }
  renderer.render(stage);
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);
