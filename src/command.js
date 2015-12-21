
import async from 'async';

import Argument from './argument';
import Input from './input';
import Output from './output';
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
    async.series(this.beforeTasks.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    }), cb);
  }
  run(args, done) {
    let input = util.findType('Input', args) || util.findType('Object', args) || Input.init();
    let output = util.findType('Output', args) || Output.init();
    done = util.findType('Function', arguments) || function(err) {if (err) throw err};
    
    try {
      this.normalizeArguments(input);
    } catch (e) {
      return done(e);
    }
    
    args = [input, output]; 

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

export default Command;
