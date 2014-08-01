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
  animate, raf;
stage.interactive = true;

// Set everything up
gameState.connect(window.location.hash.replace(/[^a-z]+/g, "") || "default");
gameState.currentStage = stages.join;
gameState.currentStage.container.visible = true;

document.body.appendChild(renderer.view);

// Reload if hash has changed
window.addEventListener("hashchange", function () {
  window.location.reload();
}, false);

// Compatability
raf = function (func) {
  if (window.requestAnimationFrame != undefined) {
    window.requestAnimationFrame(func);
  } else {
    setTimeout(func, 16);
  }
}
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
  raf(animate);
};
raf(animate);
// gs = gameState;
