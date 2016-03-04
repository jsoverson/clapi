'use strict';

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _async = require('async');

var _async2 = _interopRequireWildcard(_async);

exports['default'] = {
  'typeof': function _typeof(obj) {
    var type = ({}).toString.call(obj).slice(8, -1);
    if (type === 'Object') {
      type = obj.toString().slice(8, -1);
    }
    return type;
  },
  findType: function findType(type, args) {
    var _this = this;

    var matching = Array.prototype.slice.call(args).filter(function (el) {
      return _this['typeof'](el) === type;
    });
    return matching[0];
  },
  runTasks: function runTasks(defs, args, done) {
    var boundHandlers = defs.map(function (handlerFn) {
      if (handlerFn.length === 3) return handlerFn.bind.apply(handlerFn, [null].concat(_toConsumableArray(args)));else return function (cb) {
        handlerFn.apply(undefined, _toConsumableArray(args));
        cb();
      };
    });
    _async2['default'].series(boundHandlers, function (err, results) {
      done.apply(undefined, [err].concat(_toConsumableArray(args)));
    });
  } };
module.exports = exports['default'];