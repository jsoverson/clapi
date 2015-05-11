
import async from 'async';

import _ from 'lodash';

export default {
  findType(type, args) {
    var matching = Array.prototype.slice.call(args).filter(el => {
      var elType = ({}).toString.call(el).slice(8,-1);
      if (elType === 'Object') {
        elType = el.toString().slice(8,-1);
      }
      return elType === type;
    });
    return matching[0];
  },
  runTasks : (defs, args, done) => {
    let boundHandlers = defs.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    });
    async.series(boundHandlers, (err, results) => { done(err, ...args) });
  },
  runCommands : (defs, args, done) => {
    let commands = _.pluck(defs, 'command');
    let boundHandlers = commands.map(command => {
      return command.run.bind(command, args);
    });
    async.series(boundHandlers, (err, results) => { done(err, ...args) });
  },
  runHandlers : (defs, args, done) => {
    let handlers = _.pluck(defs, 'handler');
    let boundHandlers = handlers.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    });
    async.series(boundHandlers, (err, results) => { done(err, ...args) });
  }
};
