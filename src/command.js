
import util from './util';
import async from 'async';

import Input from './input';
import Output from './output';

class Command {
  constructor(task) {
    this.beforeTasks = [];
    this.afterTasks = [];
    this.tasks = [];
    if (task) this.add(task);
  }
  static init(...args) {
    return new this(...args);
  }
  before(fn) {
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

    // Default to input.command if none specified
    async.series([
          cb => this.runBefore(args, cb),
          cb => util.runTasks(this.tasks, args, cb),
          cb => this.runAfter(args, cb)
      ],
      (err, results) => {done && done(err, ...args)}
    );
  }
}

export default Command;
