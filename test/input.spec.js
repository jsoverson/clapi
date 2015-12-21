
import assert from 'assert';

import Input from '../src/input';

describe('Input', () => {
  var input;
  beforeEach(() => {
    input = Input.init();
  });
  it('should instantiate', () => {
    assert.ok(input instanceof Input);
  });
  it('should populate with input data', () => {
    let input = Input.init({customVal : true});
    assert(input.customVal);
  });
  it('should populate a basedir', () => {
    assert.equal(input.cwd, process.cwd());
  });
  it('should be clonable', () => {
    input.oldProp = 'oldVal';
    var newInput = input.clone({additionalProp:'value'});
    assert(newInput !== input);
    assert.equal(input.oldProp, 'oldVal');
    assert(!('additionalProp' in input));
    assert.equal(newInput.additionalProp, 'value');
    assert.equal(newInput.oldProp, 'oldVal');
  });
  it('should be able to merge data into properties with one command', () => {
    input.args = {
      oldVal: 2
    };
    input.merge('args', {newVal : 3});
    assert.equal(input.args.oldVal, 2);
    assert.equal(input.args.newVal, 3);
  });
  it('should have a shortcut for clone->merge', () => {
    input.args = {
      oldVal: 2
    };
    var newInput = input.merged('args', {newVal : 3});
    assert(input !== newInput);
    assert.equal(newInput.args.oldVal, 2);
    assert.equal(newInput.args.newVal, 3);
  });
  it('should have a unique toString()', () => {
    assert.equal(input.toString(), '[object Input]');
  });
});