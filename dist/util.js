'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = {
  typeof: function _typeof(obj) {
    var type = {}.toString.call(obj).slice(8, -1);
    if (type === 'Object') {
      type = obj.toString().slice(8, -1);
    }
    return type;
  },
  findType: function findType(type, args) {
    var _this = this;

    var matching = Array.prototype.slice.call(args).filter(function (el) {
      return _this.typeof(el) === type;
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
    _async2.default.series(boundHandlers, function (err, results) {
      done.apply(undefined, [err].concat(_toConsumableArray(args)));
    });
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2tCQUdlO0FBQ2IsMkJBQU8sS0FBSztBQUNWLFFBQUksT0FBTyxHQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLEtBQXhCLENBQThCLENBQTlCLEVBQWdDLENBQUMsQ0FBRCxDQUF2QyxDQURNO0FBRVYsUUFBSSxTQUFTLFFBQVQsRUFBbUI7QUFDckIsYUFBTyxJQUFJLFFBQUosR0FBZSxLQUFmLENBQXFCLENBQXJCLEVBQXVCLENBQUMsQ0FBRCxDQUE5QixDQURxQjtLQUF2QjtBQUdBLFdBQU8sSUFBUCxDQUxVO0dBREM7QUFRYiw4QkFBUyxNQUFNLE1BQU07OztBQUNuQixRQUFJLFdBQVcsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLElBQXRCLENBQTJCLElBQTNCLEVBQWlDLE1BQWpDLENBQXdDO2FBQU0sTUFBSyxNQUFMLENBQVksRUFBWixNQUFvQixJQUFwQjtLQUFOLENBQW5ELENBRGU7QUFFbkIsV0FBTyxTQUFTLENBQVQsQ0FBUCxDQUZtQjtHQVJSOztBQVliLFlBQVcsa0JBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLEVBQXNCO0FBQy9CLFFBQUksZ0JBQWdCLEtBQUssR0FBTCxDQUFTLHFCQUFhO0FBQ3hDLFVBQUksVUFBVSxNQUFWLEtBQXFCLENBQXJCLEVBQXdCLE9BQU8sVUFBVSxJQUFWLG1CQUFlLGdDQUFTLE1BQXhCLENBQVAsQ0FBNUIsS0FDSyxPQUFPLFVBQVUsRUFBVixFQUFjO0FBQ3hCLHNEQUFhLEtBQWIsRUFEd0I7QUFFeEIsYUFGd0I7T0FBZCxDQURaO0tBRDJCLENBQXpCLENBRDJCO0FBUS9CLG9CQUFNLE1BQU4sQ0FBYSxhQUFiLEVBQTRCLFVBQUMsR0FBRCxFQUFNLE9BQU4sRUFBa0I7QUFBRSw2QkFBSywrQkFBUSxNQUFiLEVBQUY7S0FBbEIsQ0FBNUIsQ0FSK0I7R0FBdEIiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGFzeW5jIGZyb20gJ2FzeW5jJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICB0eXBlb2Yob2JqKSB7XG4gICAgdmFyIHR5cGUgPSAoe30pLnRvU3RyaW5nLmNhbGwob2JqKS5zbGljZSg4LC0xKTtcbiAgICBpZiAodHlwZSA9PT0gJ09iamVjdCcpIHtcbiAgICAgIHR5cGUgPSBvYmoudG9TdHJpbmcoKS5zbGljZSg4LC0xKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGU7XG4gIH0sXG4gIGZpbmRUeXBlKHR5cGUsIGFyZ3MpIHtcbiAgICB2YXIgbWF0Y2hpbmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKS5maWx0ZXIoZWwgPT4gdGhpcy50eXBlb2YoZWwpID09PSB0eXBlKTtcbiAgICByZXR1cm4gbWF0Y2hpbmdbMF07XG4gIH0sXG4gIHJ1blRhc2tzIDogKGRlZnMsIGFyZ3MsIGRvbmUpID0+IHtcbiAgICBsZXQgYm91bmRIYW5kbGVycyA9IGRlZnMubWFwKGhhbmRsZXJGbiA9PiB7XG4gICAgICBpZiAoaGFuZGxlckZuLmxlbmd0aCA9PT0gMykgcmV0dXJuIGhhbmRsZXJGbi5iaW5kKG51bGwsIC4uLmFyZ3MpO1xuICAgICAgZWxzZSByZXR1cm4gZnVuY3Rpb24gKGNiKSB7XG4gICAgICAgIGhhbmRsZXJGbiguLi5hcmdzKTtcbiAgICAgICAgY2IoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgYXN5bmMuc2VyaWVzKGJvdW5kSGFuZGxlcnMsIChlcnIsIHJlc3VsdHMpID0+IHsgZG9uZShlcnIsIC4uLmFyZ3MpOyB9KTtcbiAgfSxcbn07XG4iXX0=