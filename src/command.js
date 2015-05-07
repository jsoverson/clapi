
import util from './util';
import async from 'async';

import Argument from './argument';
import Input from './input';
import Output from './output';

class Command {
  constructor(task) {
    this.beforeTasks = [];
    this.afterTasks = [];
    this.tasks = [];
    this.args = [];
    if (task) this.add(task);
  }
  static init(...args) {
    return new this(...args);
  }
  arg(...args) {
    var arg = Argument.init(...args);
    this.args.push(arg);
    return arg;
  }
  use(fn) {
    this.beforeTasks.push(fn);
  }
  after(fn) {
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
    async.series(this.beforeTasks.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    }), cb);
  }
  run(args, done) {
    if (typeof args === 'function') {
      done = args;
      args = [Input.init(), Output.init()];
    }
    
    try {
      this.reconcileArguments(args[0]);
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
  reconcileArguments(input) {
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

export default Command;
