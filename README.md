# polly-phil

[requirejs](https://github.com/jrburke/requirejs/) plugin providing
conditional polyfill loading, avoiding additional document loads
when the feature is already detected as supported and providing
modularity as with other AMD modules as far as not needing to
add additional script tags or embed polyfill code within one's modules
beyond identifying the required polyfills (and adding the files or
specifying the file dependencies).

Requires the text `polyfill!` followed by a file name (without `.js`)
where the latter (e.g., `Object.keys`) must be expressed exactly
as the global reference to detect, and if not supported,
created (and a module must be placed at `Object.keys.js`).

The `Object.keys.js` module should define the
property/method to be automatically set at the
supplied global file reference (e.g., the `Object.keys` function).

Note that the polyfill plugin will automatically create objects at each
level if not already supported (e.g., it would have defined `Object` as
`{}` had it not already been defined). Note that for some polyfills,
such as if you were attempting to polyfill DOM prototypes, like
Element.prototype or Node.prototype, the plugin may appear
to create the object successfully, but it will not work properly if
used in an older browser like IE7 which does not have nor utilize the
Element prototype.

Note that the polyfill plugin works in the browser by adding to the "window"
property and in Node.js by adding to the "global" property (since a true
polyfill should be available throughout one's code,
allowing one to use well-understood semantics and syntax).

# Examples

## Example 1

```javascript
// We avoid additional load of the Object.keys.js file if an Object.keys implementation is already available

require(['polyfill!Object.keys'],
    //   We can include the argument "alreadyExisted" for demonstration of whether the browser already
    //     had an implementation available to it, but should usually not be necessary
    function (alreadyExisted) {
        alert(alreadyExisted); // gives false in IE quirks mode, true in Firefox, etc.
        alert(Object.keys({a: 1, b: 2})); // ['a','b']
    }
);
```

## Example 2

```javascript
// The callback argument is not needed with polyfills; we can therefore supply all polyfill
//   strings at the end of the require/define array to avoid needing to even define
//   the argument(s).
require(['someModule', 'polyfill!Object.keys'],
    function (someModule) {
        someModule.doSomething();
        alert(Object.keys({a: 1, b: 2})); // ['a','b']
    }
);
```

## Example 3

For convenience, one may also load multiple polyfills at once,
requiring an empty `!` at the end of the `polyfill!` expression, or, if
detection is desired inline (instead of via configuration--see below), any
number of `!<method>` sequences can be added where `<method>`
references a method name that is required to avoid loading the whole set of
polyfills (since we need to know which item to check to avoid loading the
file).

```javascript
// We assume we can avoid additional load of Array methods if map is already available
require(['writeBr', 'polyfill!Array.prototype!map'], function (writeBr) {
    writeBr([3, 4, 5, 6].map(function (i) {return i > 4;})); // [false, false, true, true]
});
```

## Example 4

As an alternative means of adding multiple polyfill detection within
require calls, `require.config` can be called with the `config` property
set to `polyfill` with a `detect` child object following the structure of the object
(e.g., `Array.protoype` would be `{Array: {prototype : ... }}` where
the final value can either be a boolean to determine whether to
always avoid loading or not, a method name string to check against the
terminal object (e.g., against `Array.prototype`), an array of such
required method names, a callback accepting the terminal object
as argument and required to return a truthy value to avoid loading,
or an object with a `detect` property set to any of the same (for
cases when there is already a child property set--see the
example in `polyfills.html`).

Notice that the following example also demonstrates an ability
to add an alias (via an ampersand (`@`) immediately after the
variable name) in order to specify a (differently-named) module.
This may be especially useful in cases where there may be multiple
polyfill groups one may wish to load on a given variable (as opposed to
just multiple polyfills), such as when seeking to load both the
`Array` class methods (e.g., `Array.isArray`) as well as
Array generics. Multiple groups are desirable here because
Array generics are not standard, while the regular Array.js
file is reserved for standard methods.

```javascript
require.config({
    config: {
        polyfill: {
            detect: {
                // If both of the following methods are present on Array,
                //   the ArrayGenerics.js polyfill file will not be loaded as asserted
                //   to be not needed
                Array: ['slice', 'map']
            }
        }
    }
});
require(['writeBr', 'polyfill!Array@ArrayGenerics!'], function (writeBr) {
    writeBr(Array.slice([3, 4, 5, 6], 2)); // [5, 6]
});
```

# Configuration options

`baseUrl`: Set to a path such as "../polyfills". If the path is suspected to have a protocol (by the presence of a colon character) or be an absolute path (by having a "/" at the beginning), the alias or path supplied with the `require(['!polyfill...'])` call will be appended along with ".js". Otherwise, the main config.baseUrl will be used and the polyfill baseUrl appended to it. Defaults to "../jam" (i.e., a "jam" folder one level above the main baseUrl directory (your executing HTML file by default)) for the sake of easy compatibility with [Jam](jamjs.org/)-installed polyfill packages (while allowing the the default baseUrl, the executing HTML file, to reside (with its potential dependencies) in a cleanly-separated sibling folder). If your main file resides at root, you will need to change this value.

A trailing "/" is allowed but not required.

`pathDepth`: Set to "one" or "full" for an automatic file path namespacing; if set to "one", it will take the top-level parent object. For example, if the property is "Array.prototype.map" (e.g., `require(['polyfill!Array.prototype.map'])`) the polyfill plugin will look within a folder of the name "Array" for the file (as determined by fileFormat which defaults to the full form, i.e., "Array.prototype.map.js") so it will look for a polyfill at "Array/Array.prototype.map.js".

If set to "full", the automatic namespacing of the parent objects will be as deep as possible; using our previous example, it would lead to "Array/prototype/Array.prototype.map.js". One can leave off this property or set it to 'none' or 'default' to indicate no change from the default lack of automatic file path namespacing.

If you already have a path prefix and apply this property, it will insert the automated path addition after your directory path. For example, if using `pathDepth` set to "full" for `require(['polyfill!myPolyfills/Array.prototype.map']);`, the resultant path would be: `myPolyfills/Array/prototype/Array.prototype.map.js`.

If an alias is set, this property will be ignored.

`fileFormat`: Must be set with `pathDepth` to take effect. Set to "remainder", "full", or if pathDepth is "full", it can also be set to "index". Defaults to "full". If set to "full", the file is expected to include the full object portion of the file name (e.g., "Array.prototype.map.js"). If set to "remainder", the file name should drop the previous paths automatically namespaced by the pathDepth property. For example, if pathDepth had been "full", a fileFormat of "remainder" would cause the plugin to look for a file name "map.js", whereas if the pathDepth had been "one", a fileFormat of "remainder" would cause the plugin to look for a file name "prototype.map.js".

If an alias is set, this property will be ignored.

# Browserify

For users of browserify, I have added an overly simple and very experimental browserify
transforming plugin to experiment with converting require('!polyfill...') statements into checks
for existence of the global and conditional require-based usage of the polyfill (in a manner similar
to that used for the AMD-style plugin that is the main focus of this repository).

This will allow one to use Node.js-style require statements of polyfill files in Node or the browser.
But note that since Node does not recognize these statements either, the only way this can work
currently is to "browserify" the code for Node usage as well! But in doing this, one must manually
add a line such as `var self = typeof global === 'undefined' ? window : global;` to the top of the
"browserified" file to have it work in Node as well as the browser.

The following (while in the polyfill/browserify directory):

```browserify -t ./generic-polyfillify main.js > bundle.js```

...will convert:

```javascript
// Currently requires separate requires for each polyfill (see below)
require('polyfill!Array.prototype.indexOf');
require('polyfill!ArrayBuffer');
```

...into:
```javascript
!Array.prototype.indexOf ? require('./polyfills/Array.prototype.indexOf') : '';
typeof ArrayBuffer !== 'undefined' ? require('./polyfills/ArrayBuffer') : '';
```

There are a number of shortcomings (pull requests welcome!):

1. The real polyfill file (assuming it is needed) is always assumed to be within the "./polyfills/" path. (If browserify transformations can accept additional (config) arguments, we might accept the same format as used in the RequireJS AMD polyfill plugin.
2. There is not a lot of checking about the context when replacing `require('!polyfill...')` statements (if the statement is added where the previous line is a function missing an ending semicolon?) which could cause errors.
3. The syntax does not support all features of the RequireJS polyfill plugin syntax
4. Does not currently check for each component's existence (e.g., checking "Array.prototype.indexOf" does not first verify Array.prototype exists).
5. I have not allowed the require to accept an array of polyfills even though the transformer could handle it; I first want to see whether it is possible to overload the built-in Node require and if so, whether it can handle the array format.

I would also like to add an option to strip `require('!polyfill...')'` entirely without disturbing line numbers (e.g., to use in browser (or Node) which doesn't need polyfill code loaded or checked) and an option to convert to a genuine require without first checking whether the global exists or not (e.g., for IE-only (conditional-comment-loaded) polyfill file where one knows that the global is missing). Actually, I really should always require the polyfills to be in comments so as to work as is in Node (and since browserify needs a compile step anyways).

(I'd also like to make such an equivalent plugin for [AsYouWish](https://github.com/brettz9/asyouwish/wiki/Developer-Guidelines#requirejs-priv-plugin) to support another needed-in-the-browser-but-not-the-server need.)

# Todos

1. Configuration or other way to avoid creating namespace objects (e.g., if access could cause error or behavior like window.location?); ensure detection (as with generics) works on Node (with amdefine); indicate need in docs to use "!" at end
1. Documentation on whether to return a value and/or set global, whether to check in the module or not, how to write to support non-AMD environment (Node or browser)
1. Situation where want to always polyfill no matter the support or some other type checking (detect: true); any may to use markup?
1. Do we want dependencies since most only required for testing?
1. Clean-up readme with new info
1. Add tests (browser and Node) for optimizer when done
1. Work with optimizer to either ensure all polyfill files are included in case they are needed or made browser-specific (or relegate to IE conditional comments--a block which might be auto-built).

1. Support npm-constrained file name conversion (also in RequireJS - https://github.com/jrburke/requirejs/issues/846
 ?) since useful to host browser polyfills with npm for easy install but upper-case and dots are not allowed in the file names we use for auto-detection. (The plugin would probably also need to be changed to look inside the node_modules directory). Asked at https://github.com/isaacs/npm/issues/3105#issuecomment-22453074 for possible change. If not changeable the tilde might be the most URL-friendly symbol which isn't regularly used in file names.
1. Start populating polyfills at the polyfill wiki and explaining the approach/advantages (adapting structure for amd and also browserify/polyfillify plugin?) and npm (adapting file names)! (including latest Array.prototype.slice work or any other gist/desktop polyfill work) according to best cross-environment support; add to separate repo indicating strict rules so this plugin size can be small and itself modular?

# Rejected ideas

1. Apply autoNamepsace to aliases (using the path portion). While this might be convenient in some cases (e.g., to reference array generics in an Array folder without repeating "Array" in the alias portion), one should have the freedom to store them elsewhere (e.g., in a "generics" folder outside of the polyfill folder), and one might not expect changes to an alias anyways.
1. Providing separate plugins for polyfills returning multiple polyfills versus single ones. It could admittedly reduce the file size by about half, especially shrinking size for the single polyfill, but I believe it is easier to avoid missing the new distinguishing mark of an exclamation mark at the end than it is to avoid missing a "polyfill!" vs. "polyfills!". It is also easier to maintain given their shared code, and adds some convenience to users to help them avoid installing an additional plugin.
