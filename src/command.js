
import async from 'async';
import extend from 'extend';

import util from './util';

export default class Command {
  constructor(task) {
    this.beforeTasks = [];
    this.afterTasks = [];
    this.tasks = [];
    this.commands = {};
    this.args = [];
    this.middleware = [];
    if (task) this.add(task);
  }
  toString() {
    return `[object ${this.constructor.name}]`;
  }
  command(name, handler) {
    var command = util.typeof(handler) === 'Command' ? handler : Command.create(handler);
    this.commands[name] = command;
    return command;
  }
  static create(...args) {
    return new this(...args);
  }
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }
  before(fn) {
    this.beforeTasks.push(fn);
    return this;
  }
  after(fn) {
    this.afterTasks.push(fn);
    return this;
  }
  add(handler) {
    this.tasks.push(handler);
    return this;
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
  runCommand(/*command, args, done*/) {
    let [commandName, args, done] = normalizeRunArguments(...arguments);
    if (!this.commands[commandName]) throw new Error(`command ${commandName} not found`);

    if (typeof done !== 'function') {
      throw new Error('.runCommand() called without a callback.');
    }

    async.series([
      cb => this.runBefore(args, cb),
      cb => this.commands[commandName].run(args, cb),
      cb => this.runAfter(args, cb)
    ],
      (err, results) => done(err, ...args)
    );

  }
  run(/* ?name, */ args, done) {
    if (typeof args === 'string') return this.runCommand.apply(this, arguments);
    
    done = util.findType('Function', arguments) || function(err) {if (err) throw err;};
    if (!(args instanceof Array)) args = [{}, {}];
    
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

export function normalizeRunArguments(/*commandName, [input, output], done*/) {
  let done, commandName, args;

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
