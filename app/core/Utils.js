/*
 * LevelTimer.js
 * An object with multiple useful functions.
 */
module.exports.clamp = function (n, min, max) {
  "use strict";
  return n < min ? min : n > max ? max : n;
};
module.exports.lerp = function (a, b, n) {
  "use strict";
  return a * (1 - n) + b * n;
};
