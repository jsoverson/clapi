
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
  it('should allow data to be pushed to the output stream', () => {
    output.push({ value : 'object data'});
    var data = output.pop();
    assert.equal(data.value, 'object data');
  });
  it('should have a unique toString()', () => {
    assert.equal(output.toString(), '[object Output]');
  });
});