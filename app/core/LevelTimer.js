/*
 * LevelTimer.js
 * An object to manage timing in a level
 */
module.exports = function (gameState) {
  "use strict";
  this.gameState = gameState;
  this.elapsed = 0;
  this.useCache = false;
};
// Caches all timing info for fast access within a frame.
module.exports.prototype.cache = function () {
  "use strict";
  this.useCache = false;
  this.elapsed = this.getElapsed();
  this.useCache = true;
  this.day = this.getDay();
};
// Invalidates all cached timing info.
module.exports.prototype.unCache = function () {
  "use strict";
  this.useCache = false;
};
// Returns the number of milliseconds elapsed since the start of the level.
module.exports.prototype.getElapsed = function () {
  "use strict";
  if (this.gameState.globals.playing === false || this.gameState.startTime == null) {
    // Not in a game!
    return 0;
  }
  if (this.useCache === true) {
    return this.elapsed;
  }
  var elapsed;
  elapsed = Date.now() - this.gameState.startTime;
  if (elapsed < 0) {
    elapsed = 0;
  }
  return elapsed;
};
// Returns the in-game day.
module.exports.prototype.getDay = function () {
  "use strict";
  if (this.gameState.globals.playing === false || this.gameState.globals.currentLevel.dayLength <= 0) {
    // Not in a game, or frozen time
    return this.gameState.globals.currentLevel.startTime;
  }
  return this.gameState.globals.currentLevel.startTime + (this.useCache === true ? this.elapsed : this.getElapsed()) / this.gameState.globals.currentLevel.dayLength;
};
