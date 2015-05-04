
import util from './util';
import async from 'async';

import Command from './command';
import Input from './input';
import Output from './output';

class App extends Command {
  constructor() {
    super();
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

// This has gotten hairy...
export function normalizeRunArguments(
  arg1 = 'default',
  arg2 = [Input.init(), Output.init()],
  arg3 = (err) => {if (err) throw err}
) {
  switch (arguments.length) {
    case 1:
      switch (typeof arg1) {
        case 'string':
          arg2 = [Input.init(), Output.init()];
          arg3 = (err) => {if (err) throw err};
          break;
        case 'function':
          arg3 = arg1;
          arg1 = 'default';
          arg2 = [Input.init(), Output.init()];
          break;
        default:
          arg2 = arg1;
          arg1 = 'default';
          arg3 = (err) => {if (err) throw err};
      }
      break;
    case 2:
      let arg1Type = typeof arg1;
      let arg2Type = typeof arg2;
      if (arg1Type === 'string' && arg2Type === 'object') {
        arg3 = (err) => {if (err) throw err};
      } else if (arg1Type === 'string' && arg2Type === 'function') {
        arg3 = arg2;
        arg2 = [Input.init(), Output.init()];
      } else if (arg1Type === 'object' && arg2Type === 'function') {
        arg3 = arg2;
        arg2 = arg1;
        arg1 = 'default';
      }
  }
  return [arg1, arg2, arg3];
}

export default App;
