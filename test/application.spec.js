
import assert from 'assert';

import application, {normalizeRunArguments} from '../src/application';

describe('app', () => {
  var app;
  beforeEach(() => {
    app = application.init();
  });
  it('should instantiate', () => {
    assert.ok(app);
  });
  it('should register and pass through commands', (done) => {
    app.command('pull', (input, output, done) => {output.a = 10; done();} );
    app.command('pull', (input, output, done) => {output.b = 100; done();} );
    app.run('pull', (err, input, output) => {
      assert.equal(output.a, 10);
      assert.equal(output.b, 100);
      done();
    });
  });
  it('should allow global middleware to augment input & output', (done) => {
    app.pre((input, output, pluginDone) => {
      output.log = (value) => {
        assert.equal(2, value);
      };
      pluginDone();
    });
    app.command('pull', (input, output) => {output.log(2);} );
    app.run('pull', [{}, {}], done);
  });
  it('should pass input & output to finalware', (done) => {
    var ran = false;
    app.post((input, output, pluginDone) => {
      assert.deepEqual(output.data, {test:true});
      ran = true;
      pluginDone();
    });
    app.command('pull', (input, output) => {output.data.test = true;} );
    app.run('pull', () => {
      assert(ran);
      done();
    });
  });
  it('should run the default command if none specified', (done) => {
    var ran = false;
    app.command('default', () => {
      ran = true;
    });
    app.command('notdefault', () => {
      throw new Error('Should not get here');
    });

    app.run(() => {
      assert(ran);
      done();
    });
  });
  it('should allow commands to be nestable', (done) => {
    app.command('a', (input, output, done) => {
      output.data.a = 2;
      app.run('b', [input, output], done);
    });
    app.command('b', (input, output) => {output.data.b = 1;});
    app.run('a', (err, input, output) => {
      assert.equal(output.data.a, 2);
      assert.equal(output.data.b, 1);
      done();
    });
  });
  describe('reconcileArguments', () => {
    function assertReturn(expectedArg1, args) {
      assert.equal(args[0], expectedArg1);
      assert(typeof args[1][0], 'object');
      assert.equal(typeof args[1][1], 'object');
      assert(typeof args[2] === 'function');
    }
    it('should normalize the arguments to run', () => {
      assertReturn('customCommand', normalizeRunArguments('customCommand', () => {}));
      assertReturn('customCommand', normalizeRunArguments('customCommand', [{}, {}], () => {}));
      assertReturn('default', normalizeRunArguments(() => {}));
    });
  });

});