
import assert from 'assert';

import application, {normalizeRunArguments} from '../src/application';
import Input from '../src/input';
import Output from '../src/output';

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
    app.run('pull', [Input.init(), Output.init()], done);
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
  it('should default the args to Input and Output instances', (done) => {
    app.command('pull', (input, output) => {
      assert(input instanceof Input);
      assert(output instanceof Output);
    });
    app.run('pull', done);
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
  // deprecated, consider deletion
  //it('should run Input.command if none specified', (done) => {
  //  var ran = false;
  //  app.command('default', () => {
  //    throw new Error('Should not get here');
  //  });
  //  app.command('notdefault', () => {
  //    ran = true;
  //  });
  //
  //  app.run([Input.init({command:'notdefault'})], () => {
  //    assert(ran);
  //    done();
  //  });
  //});
  //it('should not run the default command if an invalid command is specified', (done) => {
  //  var ran = false;
  //  app.command('default', () => {
  //    ran = true;
  //  });
  //  app.run('nonexistant', (err, input, output) => {
  //    assert(ran);
  //  });
  //  ran = false;
  //  app.run([Input.init({command:'anothernonexistantcommand'}), Output.init()], (err, input, output) => {
  //    assert(ran);
  //    done();
  //  });
  //  
  //});
  //it('should be able to batch commands', (done) => {
  //  app.use((input, output) => {
  //    input.fromMiddleware = 'from plugin';
  //    output.eos = '!'
  //  });
  //  app.command('pull', (input, output) => {output.data.command1a = input.value + input.fromMiddleware + output.eos;});
  //  app.command('pull', (input, output) => {output.data.command1b = input.value + input.fromMiddleware + output.eos;});
  //  app.command('push', (input, output) => {output.data.command2 = output.cap(input.value + ' world') + output.eos;});
  //  app.batch([
  //      ['pull', Input.init({value : 'from init '})],
  //      ['push', Input.init({value : 'Hello'}), Output.init({cap: _ => _.toUpperCase()})]
  //    ], 
  //    (err, results) => {
  //      assert.ok(!err);
  //      assert.equal(results[0].output.data.command1a, 'from init from plugin!');
  //      assert.equal(results[0].output.data.command1b, 'from init from plugin!');
  //      assert.equal(results[1].output.data.command2, 'HELLO WORLD!');
  //      done();
  //    }
  //  );
  //});
  it('should allow commands to be nestable', (done) => {
    app.command('a', (input, output, done) => {
      output.data.a = true;
      app.run('b', [input, output], done)
    });
    app.command('b', (input, output) => {output.data.b = true;});
    app.run('a', (err, input, output) => {
      assert(output.data.a);
      assert(output.data.b);
      done();
    });
  });
  describe('normalizeRunArguments', () => {
    function assertReturn(expectedArg1, args) {
      assert.equal(args[0], expectedArg1);
      assert(typeof args[1][0], 'object');
      assert.equal(typeof args[1][1], 'object');
      assert(typeof args[2] === 'function');
    }
    it('should normalize the arguments to run', () => {
      assertReturn('customCommand', normalizeRunArguments('customCommand', () => {}));
      assertReturn('customCommand', normalizeRunArguments('customCommand', [Input.init(), Output.init()], () => {}));
      assertReturn('default', normalizeRunArguments(() => {}));
    });
  });

});