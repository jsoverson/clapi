
import assert from 'assert';

import Command, {normalizeRunArguments} from '../src/command';

describe('command', () => {
  var command;
  beforeEach(() => {
    command = Command.create();
  });
  it('should instantiate', () => {
    assert.ok(command);
  });
  it('should allow basic default usage', (done) => {
    command.add((input, output, done) => {output.a = 10; done();} );
    command.run((err, input, output) => {
      assert.equal(output.a, 10);
      done();
    });
  });
  it('should register and pass through subcommands', (done) => {
    command.add((input, output, done) => {output.a = 10; done();} );
    command.add((input, output, done) => {output.b = 100; done();} );
    command.run([{},{}], (err, input, output) => {
      assert.equal(output.a, 10);
      assert.equal(output.b, 100);
      done();
    });
  });
  it('should run before and be able to augment input & output', (done) => {
    command.before((input, output, pluginDone) => {
      output.log = (value) => {
        assert.equal(2, value);
      }; 
      pluginDone();
    });
    command.add((input, output) => {output.log(2);});
    command.run([{input:true},{output:true}], done);
  });
  it('should run after and be passed the same input & output', (done) => {
    var ran = false;
    command.after((input, output, pluginDone) => {
      assert.deepEqual(output.data, {test:true});
      ran = true;
      pluginDone();
    });
    command.add((input, output) => {output.data.test = true;} );
    command.run([{},{}], (err, input, output) => {
      assert(ran);
      done();
    });
  });
  describe('middleware', function(){
    it('should run middleware even without task handlers defined', function(done){
      command.use({
        before: function(input, output, done) {
          input.middlewareBefore = 1;
          output.middlewareBefore = 10;
          done();
        },
        run: function(input, output, done) {
          input.middlewareRun = 2;
          output.middlewareRun = 20;
          done();
        },
        after: function(input, output, done) {
          input.middlewareAfter = 3;
          output.middlewareAfter = 30;
          done();
        }
      });
      command.run([{},{}], function(err, input, output) {
        if (err) return done(err);
        assert.equal(input.middlewareBefore, 1);
        assert.equal(output.middlewareBefore, 10);
        assert.equal(input.middlewareRun, 2);
        assert.equal(output.middlewareRun, 20);
        assert.equal(input.middlewareAfter, 3);
        assert.equal(output.middlewareAfter, 30);
        done();
      });
    });
    it('should run middleware before before, after, and run', function(done){
      command.use({
        before: function(input, output, done) {
          input.middlewareBefore = 1;
          output.middlewareBefore = 10;
          done();
        },
        run: function(input, output, done) {
          input.middlewareRun = 2;
          output.middlewareRun = 20;
          done();
        },
        after: function(input, output, done) {
          input.middlewareAfter = 3;
          output.middlewareAfter = 30;
          done();
        }
      });
      command.add((input, output, done) => {
        assert.equal(input.middlewareBefore, 1);
        assert.equal(output.middlewareBefore, 10);
        assert.equal(input.middlewareRun, 2);
        assert.equal(output.middlewareRun, 20);
        assert(!input.middlewareAfter);
        assert(!output.middlewareAfter);
        input.primary = 100;
        output.primary = 200;
        done();
      });
      command.run([{},{}], function(err, input, output) {
        if (err) return done(err);
        assert.equal(input.middlewareAfter, 3);
        assert.equal(output.middlewareAfter, 30);
        assert.equal(input.primary, 100);
        assert.equal(output.primary, 200);
        done();
      });
    });
    it('should not freak out on missing methods in middleware', function(done){
      command.use({
        run: function(input, output, done) {
          input.middlewareRun = 2;
          output.middlewareRun = 20;
          done();
        },
      });
      command.add((input, output, done) => {
        assert.equal(input.middlewareRun, 2);
        assert.equal(output.middlewareRun, 20);
        input.primary = 100;
        output.primary = 200;
        done();
      });
      command.run([{},{}], function(err, input, output) {
        if (err) return done(err);
        assert.equal(input.primary, 100);
        assert.equal(output.primary, 200);
        done();
      });
    });
  });
  describe('subcommands', function(){
    it('should create and run subcommands', (done) => {
      command.command('pull').add((input, output, done) => {output.a = 10; done();} )
        .add((input, output, done) => {output.b = 100; done();} );
      command.run('pull', (err, input, output) => {
        if (err) return done(err);
        assert.equal(output.a, 10);
        assert.equal(output.b, 100);
        done();
      });
    });
    it('should allow global middleware to augment input & output', (done) => {
      command.before((input, output, pluginDone) => {
        output.log = (value) => {
          assert.equal(2, value);
        };
        pluginDone();
      });
      command.command('pull').add((input, output) => {output.log(2);} );
      command.run('pull', [{}, {}], done);
    });
  });

  it('should pass input & output to after', (done) => {
    var ran = false;
    command.after((input, output, pluginDone) => {
      assert.deepEqual(output.data, {test:true});
      ran = true;
      pluginDone();
    });
    command.command('pull').add((input, output) => {output.data.test = true;} );
    command.run('pull', () => {
      assert(ran);
      done();
    });
  });
  it('should run the default command if none specified', (done) => {
    var ran = false;
    command.command('default').add(() => {
      ran = true;
    });
    command.command('notdefault').add(() => {
      throw new Error('Should not get here');
    });

    command.runCommand(() => {
      assert(ran);
      done();
    });
  });
  it('should allow commands to be nestable', (done) => {
    command.command('a').add((input, output, done) => {
      output.data.a = 2;
      command.run('b', [input, output], done);
    });
    command.command('b').add((input, output) => {output.data.b = 1;});
    command.run('a', (err, input, output) => {
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
