/*globals define*/
// For debugging
define(function () {
    'use strict';
    return function (msg) {
        var body = document.body;
        body.appendChild(document.createTextNode(msg));
        body.appendChild(document.createElement('br'));
    };
});
