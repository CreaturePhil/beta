var chai = require('chai');
var should = chai.should();
var debug = require('../lib/debug');

describe('debugging a function', function() {
  it('should console.log a function as toString', function(done) {
    function sum(a, b) {
      return a + b;
    }
    debug(sum(1, 1));
    done();
  });

  it('should console.log a object as json', function(done) {
    var obj = {
      a: 1,
      b: 2
    };
    debug(obj);
    done();
  });
});
