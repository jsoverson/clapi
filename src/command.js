
import async from 'async';
import extend from 'extend';

import util from './util';

class Command {
  constructor(task) {
    this.beforeTasks = [];
    this.afterTasks = [];
    this.tasks = [];
    this.args = [];
    this.middleware = [];
    if (task) this.add(task);
  }
  toString() {
    return `[object ${this.constructor.name}]`;
  }
  static init(...args) {
    return new this(...args);
  }
  use(middleware) {
    this.middleware.push(middleware);
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
    async.series([
      cb => util.runTasks(this.middleware.filter(middleware => middleware.after)
                                         .map(middleware => middleware.after.bind(middleware)), args, cb),
      cb => util.runTasks(this.afterTasks, args, cb),
    ], cb);
  }
  runBefore(args, cb) {
    args[0] = decorateInput(args[0]);
    args[1] = decorateOutput(args[1]);

    async.series([
      cb => util.runTasks(this.middleware.filter(middleware => middleware.before)
                                         .map(middleware => middleware.before.bind(middleware)), args, cb),
      cb => util.runTasks(this.beforeTasks, args, cb),
      cb => util.runTasks(this.middleware.filter(middleware => middleware.run)
                                         .map(middleware => middleware.run.bind(middleware)), args, cb),
    ], cb);
  }
  run(args, done) {
    done = util.findType('Function', arguments) || function(err) {if (err) throw err;};
    
    async.series([
      cb => this.runBefore(args, cb),
      cb => util.runTasks(this.tasks, args, cb),
      cb => this.runAfter(args, cb)
    ],
      (err, results) => {done && done(err, ...args);}
    );
  }
}

// TODO : TESTS!
export function decorateInput(obj = {}) {
  return extend(true, obj, {
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
  return extend(true, obj, {
    data : {}
  });
}

export default Command;
