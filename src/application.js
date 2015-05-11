
import async from 'async';

import Command from './command';
import Input from './input';
import Output from './output';
import util from './util';

class Application extends Command {
  constructor() {
    super();
  }
  toString() {
    return `[object ${this.constructor.name}]`
  }
  command(name, handler) {
    var command = Command.init(handler);
    this.tasks.push({name, command});
    return command;
  }
  run(/* commandName, args, done */) {
    let [commandName, args, done] = normalizeRunArguments(...arguments);
    
    // Default to input.command if none specified
    async.series([
        cb => this.runBefore(args, cb),
        cb => {
          if (args[0].command && commandName === 'default') commandName = args[0].command;
          cb();
        },
        cb => util.runCommands(this.getCommands(commandName), args, cb),
        cb => this.runAfter(args, cb)
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
    let commands = this.tasks.filter(command => command.name === name);
    if (commands.length === 0) commands = this.tasks.filter(command => command.name === 'default');
    return commands;
  }
}

export function normalizeRunArguments(/*commandName, [input, output], done*/) {
  var commandName = util.findType('String', arguments) || 'default';
  var args = util.findType('Array', arguments) || [];
  var input = util.findType('Input', args) || Input.init();
  var output = util.findType('Output', args) || Output.init();
  var done = util.findType('Function', arguments) || ((err) => {if (err) throw err});
  return [commandName, [input, output], done];
}

export default Application;
