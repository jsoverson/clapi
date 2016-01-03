
import assert from 'assert';

import util from '../src/util';
import Command from '../src/command';

describe('util', () => {

  describe('runCommands', () => {
    it('should execute all commands in sequence', (done) => {
      let handlers = [
        {name : 'handler1', command : Command.init((input, output, next) => { input.a = output.a = 1; next(); })},
        {name : 'handler2', command : Command.init((input, output) => { input.b = output.b = 2; })}, // note, no next()
        {name : 'handler3', command : Command.init((input, output, next) => { input.c = output.c = 3; next(); })}
      ];
      util.runCommands(handlers, [{}, {}], (err, input, output) => {
        assert.ok(!err);
        assert.equal(input.a, 1);
        assert.equal(input.b, 2);
        assert.equal(input.c, 3);
        assert.equal(output.a, 1);
        assert.equal(output.b, 2);
        assert.equal(output.c, 3);
        done();
      });
    });
  });

});