
import async from 'async';
import extend from 'extend';

import Argument from './argument';
import util from './util';

class Command {
  constructor(task) {
    this.beforeTasks = [];
    this.afterTasks = [];
    this.tasks = [];
    this.args = [];
    if (task) this.add(task);
  }
  toString() {
    return `[object ${this.constructor.name}]`
  }
  static init(...args) {
    return new this(...args);
  }
  arg(...args) {
    var arg = Argument.init(...args);
    this.args.push(arg);
    return arg;
  }
  pre(fn) {
    this.beforeTasks.push(fn);
  }
  post(fn) {
    this.afterTasks.push(fn);
  }
  add(handler) {
    this.tasks.push(handler);
  }
  runAfter(args, cb) {
    async.series(this.afterTasks.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    }), cb);
  }
  runBefore(args, cb) {
    args[0] = decorateInput(args[0]);
    args[1] = decorateOutput(args[1]);

    async.series(this.beforeTasks.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    }), cb);
  }
  run(args, done) {
    done = util.findType('Function', arguments) || function(err) {if (err) throw err};
    
    try {
      this.normalizeArguments(args[0]);
    } catch (e) {
      return done(e);
    }
    
    // Default to input.command if none specified
    async.series([
          cb => this.runBefore(args, cb),
          cb => util.runTasks(this.tasks, args, cb),
          cb => this.runAfter(args, cb)
      ],
      (err, results) => {done && done(err, ...args)}
    );
  }
  normalizeArguments(input) {
    input.args = input.args || {};
    this.args.forEach(arg => {
      if (typeof input.args[arg.name] === 'undefined') {
        if (arg.isRequired) {
          throw new Error(`Argument ${arg.name} is required`);
        }
        if (arg.defaultValue) {
          input.args[arg.name] = arg.defaultValue;
        }
      }
    });
  }
}

// TODO : TESTS!
export function decorateInput(obj = {}) {
  return extend(true, {}, obj, {
    cwd : process.cwd(),
    extend : (...args) => {
      return extend(true, obj, ...args);
    },
    cloneWith : (...args) => {
      return extend(true, {}, obj, ...args);
    } 
  });
}

export function decorateOutput(obj = {}) {
  return extend(true, {}, obj, {
    data : {}
  });
}

export default Command;
