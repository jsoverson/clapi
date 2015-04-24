
import util from './util';
import async from 'async';

import Input from './input';
import Output from './output';

class App {
  constructor() {
    this.middleware = [];
    this.finalware = [];
    this.commands = [];
  }
  static init() {
    return new this;
  }
  use(fn) {
    this.middleware.push(fn);
  }
  after(fn) {
    this.finalware.push(fn);
  }
  command(name, handler) {
    this.commands.push({name, handler});
  }
  runFinalware(args, cb) {
    async.series(this.finalware.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    }), cb);
  }
  runMiddleware(args, cb) {
    async.series(this.middleware.map(handlerFn => {
      if (handlerFn.length === 3) return handlerFn.bind(null, ...args);
      else return function (cb) {
        handlerFn(...args);
        cb();
      }
    }), cb);
  }
  run(
    commandName = 'default', 
    args = [Input.init(), Output.init()], 
    done = (err) => {if (err) throw err}
  ) {
    if (typeof commandName === 'function') {
      done = commandName;
      commandName = 'default';
    }
    if (typeof args === 'function') {
      done = args;
      args = [Input.init(), Output.init()];
    }
    async.series([
        cb => this.runMiddleware(args, cb),
        cb => util.runHandlers(this.getCommands(commandName), args, cb),
        cb => this.runFinalware(args, cb)
      ], 
      (err, results) => {done(err, ...args)}
    );
  }
  batch(runSpec, cb) {
    let fns = runSpec.map(spec => cb => {
      var commandName = spec.shift();
      var arg1 = spec.shift() || Input.init();
      var arg2 = spec.shift() || Output.init();
      this.run(commandName, [arg1, arg2], cb)
    });
    async.series(fns, (err, results) => {
      var rv = results.map(result => { return {input:result[0], output:result[1]}; });
      cb(err, rv);
    })
  }
  getCommands(name) {
    return this.commands.filter(command => command.name === name);
  }
}

export default App;