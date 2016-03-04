
var assert = require('assert');

var dist = require('.');

command = dist.create();

assert.ok(command);

command.add((input, output, done) => {output.a = 10; done();} );
command.run((err, input, output) => {
  if (err) throw new Error(err);
  assert.equal(output.a, 10);
  console.log('ok')
});
