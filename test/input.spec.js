
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
});