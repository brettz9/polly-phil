/*globals define*/

define(function () {
    'use strict';
    return function isArray (o) {
        return Object.prototype.toString.call(o) === '[object Array]';
    };
});