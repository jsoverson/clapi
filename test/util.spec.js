
import assert from 'assert';

import util from '../src/util';

describe('util', () => {

  describe('runTasks', () => {
    it('should execute all commands in sequence', (done) => {
      let handlers = [
        (input, output, next) => { input.a = output.a = 1; next(); },
        (input, output) => { input.b = output.b = 2; }, // note, no next()
        (input, output, next) => { input.c = output.c = 3; next(); }
      ];
      util.runTasks(handlers, [{}, {}], (err, input, output) => {
        if (err) return done(err);
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