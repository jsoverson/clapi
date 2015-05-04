
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
});