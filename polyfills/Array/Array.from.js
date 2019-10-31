/*globals define, require, module*/
var define;
if (typeof define !== 'function') { // We need this as Node will make it here as it does not yet support this polyfill
    define = require('amdefine')(module);
}

define(function () {
    'use strict';
    return function (object) {
        return [].slice.call(object);
    };
});
