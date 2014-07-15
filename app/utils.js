/*
 * Utils.js
 * Handy dandy (and performant) methods to be used over and over.
 */

/*
 * Restricts n between min and max.
 */
exports.clamp = function (n, min, max) {
  "use strict";
  return n < min ? min : n > max ? max : n;
};