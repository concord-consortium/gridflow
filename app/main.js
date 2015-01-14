var GameState = require("core/GameState"),
  Join = require("scenes/Join"),
  Play = require("scenes/Play");

var gameState = new GameState(),
  renderer = new PIXI.autoDetectRenderer(768, 1024),
  stage = new PIXI.Stage(0xFFFFFF),
  stages = {
    play: new Play(gameState, stage),
    join: new Join(gameState, stage)
  },
  animate, raf;
stage.interactive = true;

// Make sure not to render anything until the web fonts load. Otherwise, PIXI will set the bounding
// boxes of the text elements incorrectly, by using the fallback font. (It doesn't reset the
// bounding boxes when it re-renders with the loaded font.)
WebFont.load({
  google: {
    families: ['Titillium+Web:600,600italic,700italic:latin']
  },
  active: start,
  inactive: start
});

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

function start() {
  raf(animate);
}

// mobile safari and classic android browser don't like the vertical-center-with-translate-y-trick
// (so use js)
window.addEventListener('load', function() {
  'use strict';

  function center() {
    var canvas = document.getElementsByTagName('canvas')[0];
    canvas.style.top = ((window.innerHeight - canvas.offsetHeight) / 2) + 'px';
  }
  window.addEventListener('resize', center);
  center();
});
