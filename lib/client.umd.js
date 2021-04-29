(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('core-js/modules/es.array.iterator.js'), require('core-js/modules/es.map.js'), require('core-js/modules/es.object.to-string.js'), require('core-js/modules/es.string.iterator.js'), require('core-js/modules/web.dom-collections.iterator.js'), require('core-js/modules/es.function.bind.js'), require('core-js/modules/es.math.clz32.js'), require('crypto'), require('core-js/modules/es.regexp.exec.js'), require('core-js/modules/es.string.match.js'), require('core-js/modules/es.string.replace.js'), require('core-js/modules/es.array.join.js'), require('core-js/modules/es.string.split.js'), require('core-js/modules/es.array.slice.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'core-js/modules/es.array.iterator.js', 'core-js/modules/es.map.js', 'core-js/modules/es.object.to-string.js', 'core-js/modules/es.string.iterator.js', 'core-js/modules/web.dom-collections.iterator.js', 'core-js/modules/es.function.bind.js', 'core-js/modules/es.math.clz32.js', 'crypto', 'core-js/modules/es.regexp.exec.js', 'core-js/modules/es.string.match.js', 'core-js/modules/es.string.replace.js', 'core-js/modules/es.array.join.js', 'core-js/modules/es.string.split.js', 'core-js/modules/es.array.slice.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.client = {}, null, null, null, null, null, null, null, global.crypto));
}(this, (function (exports, es_array_iterator_js, es_map_js, es_object_toString_js, es_string_iterator_js, web_domCollections_iterator_js, es_function_bind_js, es_math_clz32_js, crypto) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // This alphabet uses `A-Za-z0-9_-` symbols. The genetic algorithm helped
  // optimize the gzip compression for this alphabet.
  var urlAlphabet$1 = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
  var urlAlphabet_1 = {
    urlAlphabet: urlAlphabet$1
  };

  var urlAlphabet = urlAlphabet_1.urlAlphabet; // It is best to make fewer, larger requests to the crypto module to
  // avoid system call overhead. So, random numbers are generated in a
  // pool. The pool is a Buffer that is larger than the initial random
  // request size by this multiplier. The pool is enlarged if subsequent
  // requests exceed the maximum buffer size.

  var POOL_SIZE_MULTIPLIER = 32;
  var pool, poolOffset;

  var random = function random(bytes) {
    if (!pool || pool.length < bytes) {
      pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
      crypto__default['default'].randomFillSync(pool);
      poolOffset = 0;
    } else if (poolOffset + bytes > pool.length) {
      crypto__default['default'].randomFillSync(pool);
      poolOffset = 0;
    }

    var res = pool.subarray(poolOffset, poolOffset + bytes);
    poolOffset += bytes;
    return res;
  };

  var customRandom = function customRandom(alphabet, size, getRandom) {
    // First, a bitmask is necessary to generate the ID. The bitmask makes bytes
    // values closer to the alphabet size. The bitmask calculates the closest
    // `2^31 - 1` number, which exceeds the alphabet size.
    // For example, the bitmask for the alphabet size 30 is 31 (00011111).
    var mask = (2 << 31 - Math.clz32(alphabet.length - 1 | 1)) - 1; // Though, the bitmask solution is not perfect since the bytes exceeding
    // the alphabet size are refused. Therefore, to reliably generate the ID,
    // the random bytes redundancy has to be satisfied.
    // Note: every hardware random generator call is performance expensive,
    // because the system call for entropy collection takes a lot of time.
    // So, to avoid additional system calls, extra bytes are requested in advance.
    // Next, a step determines how many random bytes to generate.
    // The number of random bytes gets decided upon the ID size, mask,
    // alphabet size, and magic number 1.6 (using 1.6 peaks at performance
    // according to benchmarks).

    var step = Math.ceil(1.6 * mask * size / alphabet.length);
    return function () {
      var id = '';

      while (true) {
        var bytes = getRandom(step); // A compact alternative for `for (var i = 0; i < step; i++)`.

        var i = step;

        while (i--) {
          // Adding `|| ''` refuses a random byte that exceeds the alphabet size.
          id += alphabet[bytes[i] & mask] || '';
          if (id.length === size) return id;
        }
      }
    };
  };

  var customAlphabet = function customAlphabet(alphabet, size) {
    return customRandom(alphabet, size, random);
  };

  var nanoid$1 = function nanoid() {
    var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 21;
    var bytes = random(size);
    var id = ''; // A compact alternative for `for (var i = 0; i < step; i++)`.

    while (size--) {
      // It is incorrect to use bytes exceeding the alphabet size.
      // The following mask reduces the random byte in the 0-255 value
      // range to the 0-63 value range. Therefore, adding hacks, such
      // as empty string fallback or magic numbers, is unneccessary because
      // the bitmask trims bytes down to the alphabet size.
      id += urlAlphabet[bytes[size] & 63];
    }

    return id;
  };

  var nanoid_1 = {
    nanoid: nanoid$1,
    customAlphabet: customAlphabet,
    customRandom: customRandom,
    urlAlphabet: urlAlphabet,
    random: random
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var urlJoin = createCommonjsModule(function (module) {
    (function (name, context, definition) {
      if (module.exports) module.exports = definition();else context[name] = definition();
    })('urljoin', commonjsGlobal, function () {
      function normalize(strArray) {
        var resultArray = [];

        if (strArray.length === 0) {
          return '';
        }

        if (typeof strArray[0] !== 'string') {
          throw new TypeError('Url must be a string. Received ' + strArray[0]);
        } // If the first part is a plain protocol, we combine it with the next part.


        if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
          var first = strArray.shift();
          strArray[0] = first + strArray[0];
        } // There must be two or three slashes in the file protocol, two slashes in anything else.


        if (strArray[0].match(/^file:\/\/\//)) {
          strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
        } else {
          strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
        }

        for (var i = 0; i < strArray.length; i++) {
          var component = strArray[i];

          if (typeof component !== 'string') {
            throw new TypeError('Url must be a string. Received ' + component);
          }

          if (component === '') {
            continue;
          }

          if (i > 0) {
            // Removing the starting slashes for each component but the first.
            component = component.replace(/^[\/]+/, '');
          }

          if (i < strArray.length - 1) {
            // Removing the ending slashes for each component but the last.
            component = component.replace(/[\/]+$/, '');
          } else {
            // For the last component we will combine multiple slashes to a single one.
            component = component.replace(/[\/]+$/, '/');
          }

          resultArray.push(component);
        }

        var str = resultArray.join('/'); // Each input component is now separated by a single slash except the possible first plain protocol part.
        // remove trailing slash before parameters or hash

        str = str.replace(/\/(\?|&|#[^!])/g, '$1'); // replace ? in parameters with &

        var parts = str.split('?');
        str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');
        return str;
      }

      return function () {
        var input;

        if (_typeof(arguments[0]) === 'object') {
          input = arguments[0];
        } else {
          input = [].slice.call(arguments);
        }

        return normalize(input);
      };
    });
  });

  var nanoid = nanoid_1.nanoid;

  var Client = /*#__PURE__*/function () {
    function Client() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/sse';
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nanoid();

      _classCallCheck(this, Client);

      this.events = new Map();
      var fullPath = urlJoin(path, key);
      this.eventSource = new EventSource(fullPath);
      this.key = key;
      this.eventSource.addEventListener('open', this.onOpen.bind(this));
      this.eventSource.addEventListener('error', this.onError.bind(this));
      this.eventSource.addEventListener('close', this.onClose.bind(this));
    }

    _createClass(Client, [{
      key: "headers",
      get: function get() {
        return {
          'sse-key-e5b6a1db': this.key
        };
      } // addSSEHeadersToAxiosClient(axiosInstance) {
      // 	axiosInstance.interceptors.request.use(config => {
      // 		config.headers['sse-key'] = this.key
      // 		return config
      // 	})
      // }

    }, {
      key: "onOpen",
      value: function onOpen(event) {// console.log('onOpen')
      }
    }, {
      key: "onError",
      value: function onError(event) {// console.log('client onError called')
      }
    }, {
      key: "onClose",
      value: function onClose(event) {
        this.eventSource.close();
        this.eventSource = null;
      }
    }, {
      key: "addEventListener",
      value: function addEventListener(eventName, _callback) {
        // this assumes a single listener for each event
        var callback = function callback(event) {
          var type = event.type;
          var data = JSON.parse(event.data);

          _callback({
            type: type,
            data: data
          });
        };

        this.removeEventListener(eventName);
        this.events.set(eventName, callback);
        this.eventSource.addEventListener(eventName, callback);
      }
    }, {
      key: "removeEventListener",
      value: function removeEventListener(eventName) {
        var callback = this.events.get(eventName);

        if (callback) {
          this.events["delete"](eventName);
          this.eventSource.removeEventListener(eventName, callback);
        }
      }
    }]);

    return Client;
  }();

  var client = Client;

  exports.default = client;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=client.umd.js.map
