
import assert from 'assert';

import Argument from '../src/argument';

describe('argument', () => {
  it('should instantiate', () => {
    var arg = Argument.init();
    assert.ok(arg);
  });
  it('should accept names and default values', () => {
    var arg = Argument.init('verbose', 'defaultValue', 'description');
    assert.equal(arg.value, 'defaultValue');
  });
});