/**
* From {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter}
*/
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/) {
    'use strict';

    if (this == null) {
      throw new TypeError();
    }

    var t = Object(this),
        len = t.length >>> 0,
        res, thisp, i, val;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    res = [];
    thisp = arguments[1];
    for (i = 0; i < len; i++) {
      if (i in t) {
        val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}
