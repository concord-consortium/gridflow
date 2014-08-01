/*
 * Utils.js
 * An object with multiple useful functions.
 */
// Returns the median of n, min, and max.
module.exports.clamp = function (n, min, max) {
  "use strict";
  return n < min ? min : n > max ? max : n;
};
// Linearly intERPolates between a and b by factor n
module.exports.lerp = function (a, b, n) {
  "use strict";
  return a * (1 - n) + b * n;
};
// Linearly intERPolates (Through the RGB space) between
// hexadecimal colors a and b by factor n
module.exports.lerpColor = function (a, b, n) {
  "use strict";
  return (this.lerp(a >> 0 & 255, b >> 0 & 255, n) | 0) |
    (this.lerp(a >> 8 & 255, b >> 8 & 255, n) | 0) << 8 |
    (this.lerp(a >> 16 & 255, b >> 16 & 255, n) | 0) << 16;
};
// A common, easily upgradable function for vibration, easily
// modifiable when the spec changes.
module.exports.vibrate = function (t) {
  "use strict";
  if (window.navigator.vibrate != undefined) {
    window.navigator.vibrate(t);
  }
};
