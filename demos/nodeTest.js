/*globals global, require, requirer, requirejs */

// Requires requirejs dependency (as specified in package.json) for Node usage; also works in browser

// Set up regretttably-necessary boilerplate at top of pipeline (though could be in separate required config file) to set up AMD-implementation-independent and environment-independent requirer variable
if (typeof window === 'undefined') {
    // global.define = require('amdefine')(module); // Unfortunately we can't do this to avoid module definition boilerplate as it depends on the specific "module"
    global.requirer = require('requirejs');
    requirer.config({
        paths: {writeBr: 'writeBrNode'}, // Todo: Find some other way to look for environment-specific versions? Might RequireJS provide a way for preference to be given, depending on the environment, to a specific folder (e.g., for Node-specific, SDK-specific, browser-specific, AsYouWish/priv!, etc. versions) and if not found there, to default; without needing to hard-code folder prefixes for each module that config.paths can use to do rerouting. (If not, one could do "envt/" prefix to indicate a module that will vary with the environment, but this asks for more typing.)
        nodeRequire: require // To ensure node module loading relative to this top-level file
    });
}
else {
    window.requirer = requirejs;
}
requirer.config({
    paths: {
        polyfillHelpers: '../polyfills/polyfillHelpers'
    },
    config: {
        polyfill: {
            pathDepth: 'one',
            baseUrl: '../polyfills',
            detect: {
                Array: {
                    // 'prototype': 'map' // Can also use a string to indicate
                    // method to check to allow all to be added (or require
                    // polyfills!Array.prototype!map, though probably better
                    // to avoid polluting the require code)
                    prototype: function (obj) {
                        'use strict';
                        return obj.map && obj.forEach;
                    },
                    // For objects already holding properties (as above), we
                    //   can use "detect" also with a string, boolean, array, or
                    //   function
                    detect: ['slice', 'map', 'of']
                }
            }
        }
    }
});

requirer(['domReady!'], function () {
'use strict';
requirer(['writeBr', 'polyfill!Array.of', 'polyfill!Array.prototype.map'], function (writeBr) {
    writeBr('hello world');
    writeBr(Array.of(3, 4, 5));
    writeBr([1, 2, 3].map(function (n) {return n + 5;}));
    
    
    requirer(['writeBr', 'polyfill!Array.prototype!map'], function (writeBr, alreadyExisted) { // No real need to use or specify the alreadyExisted argument
        writeBr(alreadyExisted); // always gives true now that has already been polyfilled
        writeBr([3, 4, 5, 6].map(function (i) {return i > 4;})); // [false, false, true, true]

        // We really shouldn't use the polyfill plugin to add non-standard properties, but we can demonstrate aliases this way.
        requirer(['writeBr', 'polyfill!Array@polyfillHelpers/ArrayGenerics!', 'polyfill!Array!'], function (writeBr, alreadyExisted, alreadyExisted2) { // No real need to use or specify the alreadyExisted arguments
            writeBr(alreadyExisted); // gives false in IE < 9, true in Firefox, etc.
            writeBr(Array.slice([3, 4, 5, 6], 2)); // [5, 6]
            writeBr(alreadyExisted2); // gives false in IE < 9, true in Firefox, etc.
            writeBr(Array.of(3, 4, 5, 6));
        });
    });
    
    
});

});
