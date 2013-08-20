/*globals define, global*/
/*jslint regexp: true */
/*
Todos:
0. Test multiple polyfills/detection in browser and Node (with amdefine); support in SDK
0. Ensure multiple polyfills work as needed with new polyfillConfig checks and actualPath/module definition (and that these are ok with jam, etc.)

1. utilize config.isBuild (=== true) to know when being optimized and call load() without doing a require when in build mode to allow certain things to be done asynchronously (e.g., to avoid including modules for browsers that don't need polyfills?)
multiplePolyfillObject
2. implement normalize()
3. implement write(), onLayerEnd(), writeFile()? (with pluginBuilder to minimize this file's size); make common dependencies through define(['./common']...)?
*/
define(['module'], function (module) {
    'use strict';
    var _polyfillPattern = /^([^.]*?)([^\/.]*)(\..*)?$/, // 1. Allows slashes (but no dots); 2. Does not allow slashes or dots ; 3. A dot and everything else to the end of the line
        // In order to write clean code, we want polyfills for 'Array.isArray' and 'Array.prototype.every', but unfortunately a recursive use of our own plugin does not work (despite these not needing to use themselves), so we have to define some shims inline/non-modularly here instead of polyfills (but you don't have to!)

        // Unlike with Array.isArray below which is small in size, a full Array.prototype.every implementation is not as compelling to take up with space here; for a full implementation, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
        _every = Array.prototype.every || function (fun) {
            var i, len = this.length;
            for (i = 0; i < len; i++) {
                if (!fun(this[i])) {
                    return false;
                }
            }
            return true;
        },
        _isArray = Array.isArray || function (o) {
                return {}.toString.call(o) === '[object Array]';
        };

    /**
    * Checks whether the supplied item to detect matches the supplied reference object
    * @param {any} detect The item to check
    * @param {object} ref The reference object
    * @returns {boolean} Whether or not the detection algorithm was false
    */
    function typeCheck (detect, ref) {
        // Checks whether the supplied item to detect matches the supplied reference object
        switch (typeof detect) { // Check whether the detection algorithm was false
            case 'boolean':
                return detect;
            case 'string':
                return !!ref[detect];
            case 'function':
                return !!detect(ref);
            case 'object':
                return (_isArray(detect) ?
                    (_every.call(detect, function (method) {
                        return ref[method];
                    })) :
                    (detect.detect ?
                        typeCheck(detect.detect, ref) :
                        false // We'll treat "null" like false or any non-array objects without any nested "detect" objects
                    )
                );
            default:
                return true; // undefined or number (or xml) means appropriate detection doesn't exist at this level, so should not be considered
        }
    }
    function _parseModuleString (moduleStr, config) {
        var replacer, actualPath, resolvedPath,
            args = moduleStr.split('!'),
            name = args[0],
            methodChecks = args.slice(1),
            cfg = config.config,
            polyfillCfg = cfg && cfg.polyfill,
            polyfillConfig = polyfillCfg || {},
            polyfillBaseUrl = (polyfillConfig.baseUrl || 'jam').replace(/([^\/])$/, '$1/'), // We want this relative to the main module path (todo: see if https://github.com/jrburke/requirejs/issues/844 prompts support for separating the plugin baseUrl and module baseUrl, in which case use the module one)
            aliased = name.split('@'),
            alias = aliased[1],
            path = aliased[0],
            polyfillPathHasProtocol = polyfillBaseUrl.indexOf(':') > -1,
            polyfillAbsolutePath = polyfillBaseUrl.charAt() === '/',
            variable = alias ?
                path : // No need to split up the path if an alias file is being used as the "path" should really just be properties
                path.split('/').slice(-1)[0],
            props = variable.split('.');
        if (!alias) { // NOTE: If file size starts becoming a concern, we could scale back on the allowable values to just allow pathDepth of "one" + fileFormat of "full" (or revert back to a single autoNamespace variable); but this approach more flexibility to directory structure
            // Using example, "polyfill!Array.prototype.map", transform later to the file path...
            switch (polyfillConfig.pathDepth) {
                case 'one':
                    switch (polyfillConfig.fileFormat) {
                        case 'remainder': // ...Array/prototype.map.js
                            replacer = function (n0, n1, n2, n3) {
                                return n1 + n2 + '/' + (n3 || n2);
                            };
                            break;
                        case 'full': default: // ...Array/Array.prototype.map.js (recommended form)
                            replacer = function (n0, n1, n2, n3) {
                                return n1 + n2 + '/' + n2 + (n3 || '');
                            };
                            break;
                    }
                    break;
                case 'full':
                    switch (polyfillConfig.fileFormat) {
                        case 'index': // ...Array/prototype/map/index.js
                            replacer = function (n0, n1, n2, n3) {
                                return (n2 + (n3 || '')).replace(/\./g, '/') + '/index';
                            };
                            break;
                        case 'remainder': // ...Array/prototype/map.js
                            replacer = function (n0, n1, n2, n3) {
                                return (n2 + (n3 || '')).replace(/\./g, '/');
                            };
                            break;
                        case 'full': default: // ...Array/prototype/Array.prototype.map.js
                            replacer = function (n0, n1, n2, n3) {
                                return (n2 + (n3 || '')).replace(/\.[^.]*?$/, '') + '/' + n2 + (n3 || '');
                            };
                            break;
                    }
                    break;
                case 'none': case 'default': default:
                    // ...Array.prototype.map.js
                    break;
            }
        }

        actualPath = alias ? path : path.replace(_polyfillPattern, replacer);
        resolvedPath = (
            (polyfillPathHasProtocol || polyfillAbsolutePath) ?
                polyfillBaseUrl :
                config.baseUrl + // config.baseUrl gets a trailing slash auto-added
                    polyfillBaseUrl
        ) + (alias || actualPath) + (polyfillPathHasProtocol || polyfillAbsolutePath ? '.js' : '');

        return {
            resolvedPath: resolvedPath,
            methodChecks: methodChecks,
            props: props
        };
    }
    /**
     * This RequireJS polyfill plugin should only be used with polyfills supplying standard (or harmonizing of implementation-dependent) behavior as normal modules should not set globals
     * The typeCheck function and its dependent shims above, as well as other variables above and below were necessary for the sake of multiple polyfills (though single polyfill code is employing them now also for convenience); the size of this file could be reduced if split back into polyfill/polyfills, but more easily convenient, less convenient for user as separate package, and less easy to confuse between similar plugin names
     * @exports polyfill
    */
    return {
        /* see https://github.com/jrburke/requirejs/pull/847 on request to add config argument
        normalize: function (moduleStr, normalize, config) {
            var resolvedPath = _parseModuleString(moduleStr, config).resolvedPath;
            return normalize(resolvedPath);
        },
        */
        load: function (moduleStr, req, load, config) {
            var i, prop,
                cb,
                canAvoidLoad = true,
                polyfillCfg = module.config(), // config.config && config.config.polyfill,
                objectToDetect = polyfillCfg && polyfillCfg.detect,
                parsed = _parseModuleString(moduleStr, config),
                resolvedPath = parsed.resolvedPath,
                methodChecks = parsed.methodChecks,
                ml = methodChecks.length,
                multiplePolyfillObject = !!ml, // Even if there is only a single trailing "!", this will still be true as the slice will add an empty string array element
                props = parsed.props,
                pl = props.length,
                w = typeof window === 'undefined' ? global : window,
                ref = w;

            if (multiplePolyfillObject) { // This code could be extracted back into its own plugin to minimize size in each, but it is convenient to just have one plugin to handle each case
                for (i = 0; i < pl; i++) {
                    prop = props[i];
                    try { // Repeat until we find the lowest level object to detect (if present)
                        objectToDetect = objectToDetect[prop];
                    }
                    catch (noPropertyOnMissingObjectError) {
                        objectToDetect = false;
                    }
                    // If a multiple polyfill file is specified, we also need to build any missing object for the last portion, so we don't exclude the last iteration in creating an object
                    if (!ref[prop]) { // We reuse this loop to auto-create objects at each level if necessary (which would only occur when not supported)
                        ref[prop] = {};
                        // We can't leave the loop yet because we still need any other objects built and the terminal ref defined
                        canAvoidLoad = false;
                    }
                    ref = ref[prop];
                }

                if (canAvoidLoad) { // If not already required to load the polyfill, ensure other excluding criteria do not apply
                    // Give a chance for config to handle if user adds final trailing "!" and a relevant config object exists
                    if (objectToDetect && methodChecks[ml - 1] === '') {
                        canAvoidLoad = typeCheck(objectToDetect, ref); // Test against lowest level objectToDetect
                    }
                    // If not already required to load the polyfill, ensure explicit checks are ok
                    for (i = 0; canAvoidLoad && i < ml; i++) { // Allow style "polyfill!Array!slice"
                        if (methodChecks[i] !== '') { // Ignore any empty "!" for now
                            canAvoidLoad = !!ref[methodChecks[i]];
                        }
                    }
                }

                // If the necessary parent properties did not exist, if any explicit terminal method checks included in the require were not found on the terminal parent object, or if the config detection is present for the terminal level but returned false, we need to load; otherwise (if canAvoidLoad is still true) we can avoid requiring the polyfill
                if (canAvoidLoad) {
                    load(true);
                    return;
                }

                cb = function (obj) {
                    for (prop in obj) { // Add the multiple polyfills exported by the file
                        if (obj.hasOwnProperty(prop)) {
                            ref[prop] = obj[prop];
                        }
                    }
                    // We pass "false" here to indicate the property was not already existing (as not detected to be present)
                    load(false);
                };
            }
            else {
                // We decrement to avoid auto-creating an object on the last property level so we can determine whether we can avoid requiring the file if the property is missing (and when missing, the last property will be set dynamically anyways).
                pl--;
                for (i = 0; i < pl; i++) {
                    prop = props[i];
                    if (!ref[prop]) { // We reuse this loop to auto-create objects at each level if necessary (which would only occur when not supported)
                        ref[prop] = {};
                    }
                    ref = ref[prop];
                }
                if (ref[props[i]]) { // If all properties are found, there is no need for an additional require as the polyfill exists
                    load(true);
                    return;
                }
                cb = function (value) {
                    ref[props[i]] = value; // Add the single polyfill exported by the file
                    // We pass "false" here to indicate the property was not already existing (as not detected to be present)
                    load(false);
                };
            }
            req([resolvedPath], cb);
        }
    };
});
