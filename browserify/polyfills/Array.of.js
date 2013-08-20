global.Array.of = function () {
    'use strict';
    // Could use array generics polyfill instead, but
    //   bulky and not standard
    return Array.prototype.slice.call(arguments);
};
