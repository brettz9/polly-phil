/*globals define, require, module*/
if (typeof define !== 'function') { // We need this as Node will make it here as it does not yet support this polyfill
    var define = require('amdefine')(module);
    var requirejs = require('requirejs');
    requirejs.config({
        paths: {polyfill: '../../demos/polyfill'},
        baseUrl: __dirname,
        nodeRequire: require
    });
    requirejs('polyfill!Array.prototype!');
    console.log('abc');
}
define(['./generics', 'polyfill!Array.prototype!'], function (generics) {
    'use strict';
    if (typeof module !== 'undefined') {
        var generics = requirejs('./generics');
        requirejs('polyfill!Array.prototype!');
    }

    
    var $Array = {};
    // We could also build the array of methods with the following, but the
    //   getOwnPropertyNames() method is non-polyfillable:
    // Object.getOwnPropertyNames(Array).filter(function (methodName) {return typeof Array[methodName] === 'function'});
    [
        'join', 'reverse', 'sort', 'push', 'pop', 'shift', 'unshift',
        'splice', 'concat', 'slice', 'indexOf', 'lastIndexOf',
        'forEach', 'map', 'reduce', 'reduceRight', 'filter',
        'some', 'every', 'isArray'
    ].forEach(function (methodName) {
        $Array[methodName] = generics.getArrayGeneric(methodName);
    });
    return $Array;
});
