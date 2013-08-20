/*globals define*/
// If allowing dynamic require, we could dynamically require these from
//   separate files so dependent, though still wouldn't be able to use our
//   current polyfill approach to define a group at once using the plug-in
define(['generics', 'polyfill!Array.prototype.forEach'], function (generics) {
    'use strict';
    var $String = {
        /*!
        * ES6 Unicode Shims 0.1
        * (c) 2012 Steven Levithan <http://slevithan.com/>
        * MIT License
        */
        fromCodePoint: function fromCodePoint () {
            var chars = [], point, offset, units, i;
            for (i = 0; i < arguments.length; ++i) {
                point = arguments[i];
                offset = point - 0x10000;
                units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
                chars.push(String.fromCharCode.apply(null, units));
            }
            return chars.join("");
        }
    };
    // We could also build the array of methods with the following, but the
    //   getOwnPropertyNames() method is non-polyfillable:
    // Object.getOwnPropertyNames(String).filter(function (methodName) {return typeof String[methodName] === 'function'});
    [
        'quote', 'substring', 'toLowerCase', 'toUpperCase', 'charAt', 
        'charCodeAt', 'indexOf', 'lastIndexOf', 'startsWith', 'endsWith', 
        'trim', 'trimLeft', 'trimRight', 'toLocaleLowerCase', 
        'toLocaleUpperCase', 'localeCompare', 'match', 'search', 
        'replace', 'split', 'substr', 'concat', 'slice', 'fromCharCode'
    ].forEach(function (methodName) {
        $String[methodName] = generics.getStringGeneric(methodName);
    });
    return $String;
});
