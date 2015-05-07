
import assert from 'assert';

import Command from '../src/command';
import Input from '../src/input';
import Output from '../src/output';

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
  it('should allow middleware to augment input & output', (done) => {
    command.use((input, output, pluginDone) => {
      output.log = (value) => {
        assert.equal(2, value);
      }; 
      pluginDone();
    });
    command.add((input, output) => {output.log(2);});
    command.run([{input:true},{output:true}], done);
  });
  it('should pass input & output to finalware', (done) => {
    var ran = false;
    command.after((input, output, pluginDone) => {
      assert.deepEqual(output.data, {test:true});
      ran = true;
      pluginDone();
    });
    command.add((input, output) => {output.data.test = true;} );
    command.run(() => {
      assert(ran);
      done();
    });
  });
  it('should default the args to Input and Output instances', (done) => {
    command.add((input, output) => {
      assert(input instanceof Input);
      assert(output instanceof Output);
    });
    command.run(done);
  });
  it('should be able to define and accept arguments', (done) => {
    command.arg('argument1', 'test');
    command.arg('argument2', undefined).required();
    
    command.add(function(input, output) {
      assert.equal(input.args.argument1, 'custom');
    });
    
    command.run([Input.init({args: {argument1 : 'custom'}}), Output.init()], (err, input, output) => {
      assert(err);
      command.run([Input.init({args: {argument1 : 'custom', argument2 : 'exists'}}), Output.init()], (err, input, output) => {
        assert(!err);
        done();
      });
    });
    
  });
});