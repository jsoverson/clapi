'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _bind = require('babel-runtime/helpers/bind')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

// TODO : TESTS!
exports.decorateInput = decorateInput;
exports.decorateOutput = decorateOutput;
exports.normalizeRunArguments = normalizeRunArguments;

var _async = require('async');

var _async2 = _interopRequireWildcard(_async);

var _extend2 = require('extend');

var _extend3 = _interopRequireWildcard(_extend2);

var _util = require('./util');

var _util2 = _interopRequireWildcard(_util);

var Command = (function () {
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
    value: (function (_command) {
      function command(_x2, _x3) {
        return _command.apply(this, arguments);
      }

      command.toString = function () {
        return _command.toString();
      };

      return command;
    })(function (name, handler) {
      var command = _util2['default']['typeof'](handler) === 'Command' ? handler : Command.create(handler);
      this.commands[name] = command;
      return command;
    })
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

      _async2['default'].series([function (cb) {
        return _util2['default'].runTasks(_this.middleware.filter(function (middleware) {
          return middleware.after;
        }).map(function (middleware) {
          return middleware.after.bind(middleware);
        }), args, cb);
      }, function (cb) {
        return _util2['default'].runTasks(_this.afterTasks, args, cb);
      }], cb);
    }
  }, {
    key: 'runBefore',
    value: function runBefore(args, cb) {
      var _this2 = this;

      args[0] = decorateInput(args[0]);
      args[1] = decorateOutput(args[1]);

      _async2['default'].series([function (cb) {
        return _util2['default'].runTasks(_this2.middleware.filter(function (middleware) {
          return middleware.before;
        }).map(function (middleware) {
          return middleware.before.bind(middleware);
        }), args, cb);
      }, function (cb) {
        return _util2['default'].runTasks(_this2.beforeTasks, args, cb);
      }, function (cb) {
        return _util2['default'].runTasks(_this2.middleware.filter(function (middleware) {
          return middleware.run;
        }).map(function (middleware) {
          return middleware.run.bind(middleware);
        }), args, cb);
      }], cb);
    }
  }, {
    key: 'runCommand',
    value: function runCommand() {
      var _this3 = this;

      var _normalizeRunArguments$apply = normalizeRunArguments.apply(undefined, arguments);

      var _normalizeRunArguments$apply2 = _slicedToArray(_normalizeRunArguments$apply, 3);

      var commandName = _normalizeRunArguments$apply2[0];
      var args = _normalizeRunArguments$apply2[1];
      var done = _normalizeRunArguments$apply2[2];

      if (!this.commands[commandName]) throw new Error('command ' + commandName + ' not found');

      if (typeof done !== 'function') {
        throw new Error('.runCommand() called without a callback.');
      }

      _async2['default'].series([function (cb) {
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

      if (typeof args === 'string') {
        return this.runCommand.apply(this, arguments);
      }done = _util2['default'].findType('Function', arguments) || function (err) {
        if (err) throw err;
      };
      if (!(args instanceof Array)) args = [{}, {}];

      _async2['default'].series([function (cb) {
        return _this4.runBefore(args, cb);
      }, function (cb) {
        return _util2['default'].runTasks(_this4.tasks, args, cb);
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

      return new (_bind.apply(this, [null].concat(args)))();
    }
  }]);

  return Command;
})();

exports['default'] = Command;

function decorateInput() {
  var obj = arguments[0] === undefined ? {} : arguments[0];

  return _extend3['default'](true, obj, {
    cwd: process.cwd(),
    extend: (function (_extend) {
      function extend(_x) {
        return _extend.apply(this, arguments);
      }

      extend.toString = function () {
        return _extend.toString();
      };

      return extend;
    })(function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _extend3['default'].apply(undefined, [true, obj].concat(args));
    }),
    cloneWith: function cloneWith() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return _extend3['default'].apply(undefined, [true, {}, obj].concat(args));
    }
  });
}

function decorateOutput() {
  var obj = arguments[0] === undefined ? {} : arguments[0];

  return _extend3['default'](true, obj, {
    data: {}
  });
}

function normalizeRunArguments() {
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

/*command, args, done*/ /*commandName, [input, output], done*/