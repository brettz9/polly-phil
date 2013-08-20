/*globals require*/

require.config({
    paths: {
        'polyfillHelpers': '../polyfills/polyfillHelpers'
    },
    config: {
        // Note: We must include this property currently because the polyfill plugin defaults to looking in a "polyfills" directory within the baseUrl directory (where the baseUrl directory defaults to the path of the executing HTML file) but we put it at a sister level in this project
        polyfill: { // IMPORTANT: This "polyfill" plugin property must be within the "config" property, as distinguished from the "shims" property at the top level for shimming non-AMD modules
            // The following work when the main "polyfill" is at the root of the web root
            pathDepth: 'one', // Namespaces one folder deep based on first part of file name preceding the first "." (though the default behavior still expects the file to contain the folder name: e.g., require('polyfill!Array.prototype.map'); would look for "Array/Array.prototype.map.js" relative to any base paths)
            baseUrl: '../polyfills', // Relative to baseUrl (which defaults to "./" of the executing HTML file or data-main on the script tag if present)
            // baseUrl: '/polyfill/polyfills',
            // baseUrl: 'http://127.0.0.1/polyfill/polyfills',

            // The following work when the main "polyfill" is a file URL:
            // baseUrl: '../polyfills', // Relative to baseUrl (which defaults to "./" of the executing HTML file or data-main on the script tag if present)
            // baseUrl: 'file://d:/wamp/www/polyfill/polyfills', // On my system
            detect: {
                Array: {
                    // 'prototype': 'map' // Can also use a string to indicate
                    // method to check to allow all to be added (or require
                    // polyfills!Array.prototype!map, though probably better
                    // to avoid polluting the require code)
                    prototype: function (obj) {
                        'use strict';
                        return obj.map;
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
