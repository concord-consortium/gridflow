"use strict";
var renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

var stage = new PIXI.Stage(0xFFFFFF);

document.body.appendChild(renderer.view);

var graphics = new PIXI.Graphics();

stage.addChild(graphics);

var animate = function () {
  renderer.render(stage);
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);