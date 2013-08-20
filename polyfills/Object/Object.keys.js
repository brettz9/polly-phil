/*globals define*/
// As a polyfill plugin, this breaks normal modularity by altering globals for sake of enabling standards on non-supporting browsers
// Adapted from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
define(function () {
    'use strict';

    if (Object.keys) { // Better to use polyfill plugin to detect presence, as reusable for other polyfills
        return Object.keys;
    }
        
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
        var i, prop, result = [];
        if ((typeof obj !== 'object' && typeof obj !== 'function') || obj === null) {
            throw new TypeError('Object.keys called on non-object');
        }

        for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
        }

        if (hasDontEnumBug) {
            for (i=0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                    result.push(dontEnums[i]);
                }
            }
        }
        return result;
    };
    return false;
});
