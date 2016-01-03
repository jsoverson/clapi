
import async from 'async';

import Command from './command';
import util from './util';

class Application extends Command {
  constructor() {
    super();
  }
  toString() {
    return `[object ${this.constructor.name}]`
  }
  command(name, handler) {
    var command = util.typeof(handler) === 'Command' ? handler : Command.init(handler);
    this.tasks.push({name, command});
    return command;
  }
  use(handler) {
    this.pre(handler);
  }
  run(/* commandName, args, done */) {
    let [commandName, args, done] = normalizeRunArguments(...arguments);

    if (typeof done !== 'function') {
      throw new Error('.run() called without a callback.')
    }
    
    let commands = this.getCommands(commandName);
    
    if (commands.length === 0) {
      return done(`No tasks specified for "${commandName}"`);
    }
    
    async.series([
        cb => this.runBefore(args, cb),
        cb => util.runCommands(commands, args, cb),
        cb => this.runAfter(args, cb)
      ], 
      (err, results) => done(err, ...args)
    );
  }
  getCommands(name) {
    let commands = this.tasks.filter(command => command.name === name);
    if (commands.length === 0) return [];
    return commands;
  }
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

export default Application;
