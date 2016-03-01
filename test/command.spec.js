
import assert from 'assert';

import Command from '../src/command';

describe('command', () => {
  var command;
  beforeEach(() => {
    command = Command.init();
  });
  it('should instantiate', () => {
    assert.ok(command);
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
  it('should run pre and be able to augment input & output', (done) => {
    command.pre((input, output, pluginDone) => {
      output.log = (value) => {
        assert.equal(2, value);
      }; 
      pluginDone();
    });
    command.add((input, output) => {output.log(2);});
    command.run([{input:true},{output:true}], done);
  });
  it('should run post and be passed the same input & output', (done) => {
    var ran = false;
    command.post((input, output, pluginDone) => {
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
  it('should run middleware before pre, post, and run', function(done){
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