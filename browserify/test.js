var punycode = require('punycode'); // Normal require

/* Polyfill requires */

require('polyfill!Array.prototype.map'); // Could also be stripped by a better implementation
require('polyfill!Array.of');

if (typeof window !== 'undefined') {
    console = {
        log: function (msg) {
            document.write(msg);
        }
    };
}

console.log(Array.of(1, 2, 3).map(function (item) {
    return item + 3;
}));