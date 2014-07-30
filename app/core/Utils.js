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
module.exports.lerpColor = function (a, b, n) {
  "use strict";
  return (this.lerp(a >> 0 & 255, b >> 0 & 255, n) | 0) |
    (this.lerp(a >> 8 & 255, b >> 8 & 255, n) | 0) << 8 |
    (this.lerp(a >> 16 & 255, b >> 16 & 255, n) | 0) << 16;
};
