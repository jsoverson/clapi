
import assert from 'assert';

import Output from '../src/output';

describe('Output', () => {
  var output;
  beforeEach(() => {
    output = Output.init();
  });
  it('should instantiate', () => {
    assert.ok(output instanceof Output);
  });
});