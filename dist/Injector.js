'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.buildResources = buildResources;
exports.injectResources = injectResources;
exports.generateAppleTags = generateAppleTags;
exports.applyTag = applyTag;
exports.generateHtmlTags = generateHtmlTags;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _Fingerprint = require('./Fingerprint');

var _Fingerprint2 = _interopRequireDefault(_Fingerprint);

var _URI = require('./URI');

var _Icons = require('./Icons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

var appleTags = {
  'apple-touch-icon': 'link',
  'apple-touch-startup-image': 'link',
  'apple-mobile-web-app-title': 'meta',
  'apple-mobile-web-app-capable': 'meta',
  'apple-mobile-web-app-status-bar-style': 'meta'
};

function manifest(options, publicPath, icons, callback) {
  var content = Object.assign({ icons: icons }, options);
  delete content.filename;
  delete content.inject;
  delete content.fingerprints;
  delete content.ios;
  var json = JSON.stringify(content, null, 2);
  var filename = _path2.default.parse(options.filename);
  var output = _path2.default.join(filename.dir, options.fingerprints ? filename.name + '.' + (0, _Fingerprint2.default)(json) + filename.ext : '' + filename.name + filename.ext);
  callback(null, {
    output: output,
    file: (0, _URI.joinURI)(publicPath, output),
    source: json,
    size: json.length
  });
}

function buildResources(_this, publicPath, callback) {
  if (_this.assets && _this.options.inject) {
    // already cached and ready to inject
    callback();
  } else {
    publicPath = publicPath || '';
    (0, _Icons.parseIcons)(_this.options.fingerprints, publicPath, (0, _Icons.retrieveIcons)(_this.options), function (err, result) {
      if (err) return;
      manifest(_this.options, publicPath, result.icons, function (fail, manifest) {
        if (fail) return;
        _this.options.filename = manifest.file;
        _this.assets = [manifest].concat(_toConsumableArray(result.assets || []));
        callback();
      });
    });
  }
}

function injectResources(compilation, assets, callback) {
  if (assets) {
    var _loop = function _loop(asset) {
      compilation.assets[asset.output] = {
        source: function source() {
          return asset.source;
        },
        size: function size() {
          return asset.size;
        }
      };
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = assets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var asset = _step.value;

        _loop(asset);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  callback();
}

function generateAppleTags(options, assets) {
  var tags = {};
  if (options.ios) {
    var apple = Object.assign({
      'apple-mobile-web-app-title': options.name,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default'
    }, _typeof(options.ios) === 'object' ? options.ios : {});
    for (var tag in apple) {
      var type = appleTags[tag];
      if (!type) continue; // not a valid apple tag
      applyTag(tags, type, formatAppleTag(tag, apple[tag]));
    }
    if (assets) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = assets[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var asset = _step2.value;

          if (asset.ios && asset.ios.valid) {
            if (asset.ios.valid === 'startup') {
              applyTag(tags, 'link', {
                rel: 'apple-touch-startup-image',
                href: asset.ios.href
              });
            } else {
              applyTag(tags, 'link', {
                rel: 'apple-touch-icon',
                sizes: asset.ios.size,
                href: asset.ios.href
              });
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }
  return tags;
}

function formatAppleTag(tag, content) {
  if (tag === 'apple-touch-icon') {
    if (typeof content === 'string') {
      return {
        rel: tag,
        href: content
      };
    } else {
      var sizes = content.sizes;
      sizes = +sizes || parseInt(sizes);
      return isNaN(sizes) ? {
        rel: tag,
        href: content.href
      } : {
        rel: tag,
        sizes: sizes,
        href: content.href
      };
    }
  } else if (tag === 'apple-touch-startup-image') {
    return {
      rel: tag,
      href: content
    };
  } else if (tag === 'apple-mobile-web-app-title') {
    return {
      name: tag,
      content: content
    };
  } else if (tag === 'apple-mobile-web-app-capable') {
    var value = content;
    if (typeof content === 'boolean' || typeof content === 'number') value = content ? 'yes' : 'no';
    return {
      name: tag,
      content: value
    };
  } else if (tag === 'apple-mobile-web-app-status-bar-style') {
    return {
      name: tag,
      content: content
    };
  }
  return null;
}

function applyTag(obj, tag, content) {
  if (!content) return;
  if (obj[tag]) {
    if (Array.isArray(obj[tag])) {
      obj[tag].push(content);
    } else {
      obj[tag] = [obj[tag], content];
    }
  } else {
    obj[tag] = content;
  }
}

function generateHtmlTags(tags) {
  var html = '';
  for (var tag in tags) {
    var attrs = tags[tag];
    if (Array.isArray(attrs)) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = attrs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var a = _step3.value;

          html = '' + html + generateHtmlTags(_defineProperty({}, tag, a));
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    } else {
      html = html + '<' + tag;
      for (var attr in attrs) {
        html = html + ' ' + attr + '="' + attrs[attr] + '"';
      }
      html = voidTags.indexOf(tag) === -1 ? html + '></' + tag + '>' : html + ' />';
    }
  }
  return html;
}