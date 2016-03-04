'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.create = create;
exports.decorateInput = decorateInput;
exports.decorateOutput = decorateOutput;
exports.normalizeRunArguments = normalizeRunArguments;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _extend2 = require('extend');

var _extend3 = _interopRequireDefault(_extend2);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = function () {
  function Command(task) {
    _classCallCheck(this, Command);

    this.beforeTasks = [];
    this.afterTasks = [];
    this.tasks = [];
    this.commands = {};
    this.args = [];
    this.middleware = [];
    if (task) this.add(task);
  }

  _createClass(Command, [{
    key: 'toString',
    value: function toString() {
      return '[object ' + this.constructor.name + ']';
    }
  }, {
    key: 'command',
    value: function command(name, handler) {
      var command = _util2.default.typeof(handler) === 'Command' ? handler : Command.create(handler);
      this.commands[name] = command;
      return command;
    }
  }, {
    key: 'use',
    value: function use(middleware) {
      this.middleware.push(middleware);
      return this;
    }
  }, {
    key: 'before',
    value: function before(fn) {
      this.beforeTasks.push(fn);
      return this;
    }
  }, {
    key: 'after',
    value: function after(fn) {
      this.afterTasks.push(fn);
      return this;
    }
  }, {
    key: 'add',
    value: function add(handler) {
      this.tasks.push(handler);
      return this;
    }
  }, {
    key: 'runAfter',
    value: function runAfter(args, cb) {
      var _this = this;

      _async2.default.series([function (cb) {
        return _util2.default.runTasks(_this.middleware.filter(function (middleware) {
          return middleware.after;
        }).map(function (middleware) {
          return middleware.after.bind(middleware);
        }), args, cb);
      }, function (cb) {
        return _util2.default.runTasks(_this.afterTasks, args, cb);
      }], cb);
    }
  }, {
    key: 'runBefore',
    value: function runBefore(args, cb) {
      var _this2 = this;

      args[0] = decorateInput(args[0]);
      args[1] = decorateOutput(args[1]);

      _async2.default.series([function (cb) {
        return _util2.default.runTasks(_this2.middleware.filter(function (middleware) {
          return middleware.before;
        }).map(function (middleware) {
          return middleware.before.bind(middleware);
        }), args, cb);
      }, function (cb) {
        return _util2.default.runTasks(_this2.beforeTasks, args, cb);
      }, function (cb) {
        return _util2.default.runTasks(_this2.middleware.filter(function (middleware) {
          return middleware.run;
        }).map(function (middleware) {
          return middleware.run.bind(middleware);
        }), args, cb);
      }], cb);
    }
  }, {
    key: 'runCommand',
    value: function runCommand() /*command, args, done*/{
      var _this3 = this;

      var _normalizeRunArgument = normalizeRunArguments.apply(undefined, arguments);

      var _normalizeRunArgument2 = _slicedToArray(_normalizeRunArgument, 3);

      var commandName = _normalizeRunArgument2[0];
      var args = _normalizeRunArgument2[1];
      var done = _normalizeRunArgument2[2];

      if (!this.commands[commandName]) throw new Error('command ' + commandName + ' not found');

      if (typeof done !== 'function') {
        throw new Error('.runCommand() called without a callback.');
      }

      _async2.default.series([function (cb) {
        return _this3.runBefore(args, cb);
      }, function (cb) {
        return _this3.commands[commandName].run(args, cb);
      }, function (cb) {
        return _this3.runAfter(args, cb);
      }], function (err, results) {
        return done.apply(undefined, [err].concat(_toConsumableArray(args)));
      });
    }
  }, {
    key: 'run',
    value: function run( /* ?name, */args, done) {
      var _this4 = this;

      if (typeof args === 'string') return this.runCommand.apply(this, arguments);

      done = _util2.default.findType('Function', arguments) || function (err) {
        if (err) throw err;
      };
      if (!(args instanceof Array)) args = [{}, {}];

      _async2.default.series([function (cb) {
        return _this4.runBefore(args, cb);
      }, function (cb) {
        return _util2.default.runTasks(_this4.tasks, args, cb);
      }, function (cb) {
        return _this4.runAfter(args, cb);
      }], function (err, results) {
        done && done.apply(undefined, [err].concat(_toConsumableArray(args)));
      });
    }
  }], [{
    key: 'create',
    value: function create() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new (Function.prototype.bind.apply(Command, [null].concat(args)))();
    }
  }]);

  return Command;
}();

exports.default = Command;
function create() {
  return Command.create.apply(Command, arguments);
}

// TODO : TESTS!
function decorateInput() {
  var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return (0, _extend3.default)(true, obj, {
    cwd: process.cwd(),
    extend: function extend() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _extend3.default.apply(undefined, [true, obj].concat(args));
    },
    cloneWith: function cloneWith() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return _extend3.default.apply(undefined, [true, {}, obj].concat(args));
    }
  });
}

function decorateOutput() {
  var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return (0, _extend3.default)(true, obj, {
    data: {}
  });
}

function normalizeRunArguments() /*commandName, [input, output], done*/{
  var done = undefined,
      commandName = undefined,
      args = undefined;

  if (arguments.length === 1 && typeof arguments[0] === 'function') {
    commandName = 'default';
    args = [{}, {}];
    done = arguments[0];
  } else if (arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
    commandName = arguments[0];
    args = [{}, {}];
    done = arguments[1];
  } else {
    commandName = arguments[0];
    args = arguments[1];
    done = arguments[2];
  }

  return [commandName, args, done];
}
//# sourceMappingURL=data:application/json;base64,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LFVBQVUsQ0FBVixDQUFQLEtBQXdCLFVBQXhCLEVBQW9DO0FBQ2hFLGtCQUFjLFNBQWQsQ0FEZ0U7QUFFaEUsV0FBTyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVAsQ0FGZ0U7QUFHaEUsV0FBTyxVQUFVLENBQVYsQ0FBUCxDQUhnRTtHQUFsRSxNQUlPLElBQUksVUFBVSxNQUFWLEtBQXFCLENBQXJCLElBQTBCLE9BQU8sVUFBVSxDQUFWLENBQVAsS0FBd0IsUUFBeEIsSUFBb0MsT0FBTyxVQUFVLENBQVYsQ0FBUCxLQUF3QixVQUF4QixFQUFvQztBQUMzRyxrQkFBYyxVQUFVLENBQVYsQ0FBZCxDQUQyRztBQUUzRyxXQUFPLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBUCxDQUYyRztBQUczRyxXQUFPLFVBQVUsQ0FBVixDQUFQLENBSDJHO0dBQXRHLE1BSUE7QUFDTCxrQkFBYyxVQUFVLENBQVYsQ0FBZCxDQURLO0FBRUwsV0FBTyxVQUFVLENBQVYsQ0FBUCxDQUZLO0FBR0wsV0FBTyxVQUFVLENBQVYsQ0FBUCxDQUhLO0dBSkE7O0FBVVAsU0FBTyxDQUFDLFdBQUQsRUFBYyxJQUFkLEVBQW9CLElBQXBCLENBQVAsQ0FqQjRFO0NBQXZFIiwiZmlsZSI6ImNvbW1hbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBhc3luYyBmcm9tICdhc3luYyc7XG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2V4dGVuZCc7XG5cbmltcG9ydCB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmQge1xuICBjb25zdHJ1Y3Rvcih0YXNrKSB7XG4gICAgdGhpcy5iZWZvcmVUYXNrcyA9IFtdO1xuICAgIHRoaXMuYWZ0ZXJUYXNrcyA9IFtdO1xuICAgIHRoaXMudGFza3MgPSBbXTtcbiAgICB0aGlzLmNvbW1hbmRzID0ge307XG4gICAgdGhpcy5hcmdzID0gW107XG4gICAgdGhpcy5taWRkbGV3YXJlID0gW107XG4gICAgaWYgKHRhc2spIHRoaXMuYWRkKHRhc2spO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgW29iamVjdCAke3RoaXMuY29uc3RydWN0b3IubmFtZX1dYDtcbiAgfVxuICBjb21tYW5kKG5hbWUsIGhhbmRsZXIpIHtcbiAgICB2YXIgY29tbWFuZCA9IHV0aWwudHlwZW9mKGhhbmRsZXIpID09PSAnQ29tbWFuZCcgPyBoYW5kbGVyIDogQ29tbWFuZC5jcmVhdGUoaGFuZGxlcik7XG4gICAgdGhpcy5jb21tYW5kc1tuYW1lXSA9IGNvbW1hbmQ7XG4gICAgcmV0dXJuIGNvbW1hbmQ7XG4gIH1cbiAgc3RhdGljIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKC4uLmFyZ3MpO1xuICB9XG4gIHVzZShtaWRkbGV3YXJlKSB7XG4gICAgdGhpcy5taWRkbGV3YXJlLnB1c2gobWlkZGxld2FyZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgYmVmb3JlKGZuKSB7XG4gICAgdGhpcy5iZWZvcmVUYXNrcy5wdXNoKGZuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBhZnRlcihmbikge1xuICAgIHRoaXMuYWZ0ZXJUYXNrcy5wdXNoKGZuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBhZGQoaGFuZGxlcikge1xuICAgIHRoaXMudGFza3MucHVzaChoYW5kbGVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBydW5BZnRlcihhcmdzLCBjYikge1xuICAgIGFzeW5jLnNlcmllcyhbXG4gICAgICBjYiA9PiB1dGlsLnJ1blRhc2tzKHRoaXMubWlkZGxld2FyZS5maWx0ZXIobWlkZGxld2FyZSA9PiBtaWRkbGV3YXJlLmFmdGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKG1pZGRsZXdhcmUgPT4gbWlkZGxld2FyZS5hZnRlci5iaW5kKG1pZGRsZXdhcmUpKSwgYXJncywgY2IpLFxuICAgICAgY2IgPT4gdXRpbC5ydW5UYXNrcyh0aGlzLmFmdGVyVGFza3MsIGFyZ3MsIGNiKSxcbiAgICBdLCBjYik7XG4gIH1cbiAgcnVuQmVmb3JlKGFyZ3MsIGNiKSB7XG4gICAgYXJnc1swXSA9IGRlY29yYXRlSW5wdXQoYXJnc1swXSk7XG4gICAgYXJnc1sxXSA9IGRlY29yYXRlT3V0cHV0KGFyZ3NbMV0pO1xuXG4gICAgYXN5bmMuc2VyaWVzKFtcbiAgICAgIGNiID0+IHV0aWwucnVuVGFza3ModGhpcy5taWRkbGV3YXJlLmZpbHRlcihtaWRkbGV3YXJlID0+IG1pZGRsZXdhcmUuYmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKG1pZGRsZXdhcmUgPT4gbWlkZGxld2FyZS5iZWZvcmUuYmluZChtaWRkbGV3YXJlKSksIGFyZ3MsIGNiKSxcbiAgICAgIGNiID0+IHV0aWwucnVuVGFza3ModGhpcy5iZWZvcmVUYXNrcywgYXJncywgY2IpLFxuICAgICAgY2IgPT4gdXRpbC5ydW5UYXNrcyh0aGlzLm1pZGRsZXdhcmUuZmlsdGVyKG1pZGRsZXdhcmUgPT4gbWlkZGxld2FyZS5ydW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAobWlkZGxld2FyZSA9PiBtaWRkbGV3YXJlLnJ1bi5iaW5kKG1pZGRsZXdhcmUpKSwgYXJncywgY2IpLFxuICAgIF0sIGNiKTtcbiAgfVxuICBydW5Db21tYW5kKC8qY29tbWFuZCwgYXJncywgZG9uZSovKSB7XG4gICAgbGV0IFtjb21tYW5kTmFtZSwgYXJncywgZG9uZV0gPSBub3JtYWxpemVSdW5Bcmd1bWVudHMoLi4uYXJndW1lbnRzKTtcbiAgICBpZiAoIXRoaXMuY29tbWFuZHNbY29tbWFuZE5hbWVdKSB0aHJvdyBuZXcgRXJyb3IoYGNvbW1hbmQgJHtjb21tYW5kTmFtZX0gbm90IGZvdW5kYCk7XG5cbiAgICBpZiAodHlwZW9mIGRvbmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignLnJ1bkNvbW1hbmQoKSBjYWxsZWQgd2l0aG91dCBhIGNhbGxiYWNrLicpO1xuICAgIH1cblxuICAgIGFzeW5jLnNlcmllcyhbXG4gICAgICBjYiA9PiB0aGlzLnJ1bkJlZm9yZShhcmdzLCBjYiksXG4gICAgICBjYiA9PiB0aGlzLmNvbW1hbmRzW2NvbW1hbmROYW1lXS5ydW4oYXJncywgY2IpLFxuICAgICAgY2IgPT4gdGhpcy5ydW5BZnRlcihhcmdzLCBjYilcbiAgICBdLFxuICAgICAgKGVyciwgcmVzdWx0cykgPT4gZG9uZShlcnIsIC4uLmFyZ3MpXG4gICAgKTtcblxuICB9XG4gIHJ1bigvKiA/bmFtZSwgKi8gYXJncywgZG9uZSkge1xuICAgIGlmICh0eXBlb2YgYXJncyA9PT0gJ3N0cmluZycpIHJldHVybiB0aGlzLnJ1bkNvbW1hbmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBcbiAgICBkb25lID0gdXRpbC5maW5kVHlwZSgnRnVuY3Rpb24nLCBhcmd1bWVudHMpIHx8IGZ1bmN0aW9uKGVycikge2lmIChlcnIpIHRocm93IGVycjt9O1xuICAgIGlmICghKGFyZ3MgaW5zdGFuY2VvZiBBcnJheSkpIGFyZ3MgPSBbe30sIHt9XTtcbiAgICBcbiAgICBhc3luYy5zZXJpZXMoW1xuICAgICAgY2IgPT4gdGhpcy5ydW5CZWZvcmUoYXJncywgY2IpLFxuICAgICAgY2IgPT4gdXRpbC5ydW5UYXNrcyh0aGlzLnRhc2tzLCBhcmdzLCBjYiksXG4gICAgICBjYiA9PiB0aGlzLnJ1bkFmdGVyKGFyZ3MsIGNiKVxuICAgIF0sXG4gICAgICAoZXJyLCByZXN1bHRzKSA9PiB7ZG9uZSAmJiBkb25lKGVyciwgLi4uYXJncyk7fVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSguLi5hcmdzKSB7XG4gIHJldHVybiBDb21tYW5kLmNyZWF0ZSguLi5hcmdzKTtcbn1cblxuLy8gVE9ETyA6IFRFU1RTIVxuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlSW5wdXQob2JqID0ge30pIHtcbiAgcmV0dXJuIGV4dGVuZCh0cnVlLCBvYmosIHtcbiAgICBjd2QgOiBwcm9jZXNzLmN3ZCgpLFxuICAgIGV4dGVuZCA6ICguLi5hcmdzKSA9PiB7XG4gICAgICByZXR1cm4gZXh0ZW5kKHRydWUsIG9iaiwgLi4uYXJncyk7XG4gICAgfSxcbiAgICBjbG9uZVdpdGggOiAoLi4uYXJncykgPT4ge1xuICAgICAgcmV0dXJuIGV4dGVuZCh0cnVlLCB7fSwgb2JqLCAuLi5hcmdzKTtcbiAgICB9IFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlT3V0cHV0KG9iaiA9IHt9KSB7XG4gIHJldHVybiBleHRlbmQodHJ1ZSwgb2JqLCB7XG4gICAgZGF0YSA6IHt9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUnVuQXJndW1lbnRzKC8qY29tbWFuZE5hbWUsIFtpbnB1dCwgb3V0cHV0XSwgZG9uZSovKSB7XG4gIGxldCBkb25lLCBjb21tYW5kTmFtZSwgYXJncztcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29tbWFuZE5hbWUgPSAnZGVmYXVsdCc7XG4gICAgYXJncyA9IFt7fSwge31dO1xuICAgIGRvbmUgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29tbWFuZE5hbWUgPSBhcmd1bWVudHNbMF07XG4gICAgYXJncyA9IFt7fSwge31dO1xuICAgIGRvbmUgPSBhcmd1bWVudHNbMV07XG4gIH0gZWxzZSB7XG4gICAgY29tbWFuZE5hbWUgPSBhcmd1bWVudHNbMF07XG4gICAgYXJncyA9IGFyZ3VtZW50c1sxXTtcbiAgICBkb25lID0gYXJndW1lbnRzWzJdO1xuICB9XG5cbiAgcmV0dXJuIFtjb21tYW5kTmFtZSwgYXJncywgZG9uZV07XG59XG4iXX0=