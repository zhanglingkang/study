var expect = require('expect.js');
var now = require('../index');

describe('combo-use-demo', function() {

  it('normal usage', function() {
      expect(now).to.be.a('string');  // add this
  });

});
