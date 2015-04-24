
import assert from 'assert';

import util from '../src/util';

describe('util', () => {

  describe('runHandlers', () => {
    it('should execute all handlers asynchronously', (done) => {
      let handlers = [
        {name : 'handler1', handler : (input, output, next) => { input.a = output.a = 1; next(); }},
        {name : 'handler2', handler : (input, output) => { input.b = output.b = 2; }}, // note, no next()
        {name : 'handler3', handler : (input, output, next) => { input.c = output.c = 3; next(); }}
      ];
      util.runHandlers(handlers, [{},{}], (err, input, output) => {
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