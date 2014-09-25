/*
 * ContractLine.js
 * A line that represents a contract.
 */
'use strict';

// base texture for contract lines to outermost cities
var outerTexture = new PIXI.BaseTexture.fromImage('images/outerContractLineDotsSpritesheet.png');
var outeSpritesheetData = require('data/spritesheets/outerContractLineDotsSpritesheet')

// TODO later

module.exports = function (cityPair, toPlayer) {
  this.sprite = this.drawable = new PIXI.Sprite();
  this.active = false;

  this.cityPair = cityPair; // 0, 1, or 2
  this.toPlayer = toPlayer;
  this.contractAge    = 0;
  this.contractLength = 0;

  this.update();
};
/**
 * Updates the graphics object
 */
module.exports.prototype.update = function () {
  // hide if !active
  // figure out which frame, if any to show, given contractAge and contractLength
  // model after CityIcon texture cachine
};
