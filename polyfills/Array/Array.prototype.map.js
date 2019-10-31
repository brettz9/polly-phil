/*globals define, require, module*/
var define;
if (typeof define !== 'function') {
    define = require('amdefine')(module);
}
define(function () {
    'use strict';
    return function map (callback, thisArg) {
        var T, A, k, kValue, mappedValue, O, len;
        if (this === null || this === undefined) {
            throw new TypeError(" this is null or not defined");
        }
        O = Object(this);
        len = O.length >>> 0;

        if ({}.toString.call(callback) !== "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }
        if (thisArg) {
            T = thisArg;
        }

        A = new Array(len);
        k = 0;
        while (k < len) {
            if (k in O) {
                kValue = O[ k ];
                mappedValue = callback.call(T, kValue, k, O);
                A[ k ] = mappedValue;
            }
            k++;
        }
        return A;
    };
});