var chai   = require('chai'),
    expect = chai.expect;
var __root = '../';
var watchData = require(__root + '/core/api_data.js');
var it = require('mocha/lib/mocha.js').it;
var beforeEach = require('mocha/lib/mocha.js').beforeEach;
var describe = require('mocha/lib/mocha.js').describe;

var data = watchData;
describe('watchData', function () {
  beforeEach(function () {
    if(data) {
      data.data = {};
    }
  });

  describe('get and set', function () {
    it('should be able to set and get a property', function () {
      data.set('testProperty', 'testValue');
      var value = data.get('testProperty');
      expect(value).to.equal('testValue');
    });
    it('should replace value if property exists', function () {
      // set initial value
      data.set('testProperty', 'testValue');
      //replace value
      data.set('testProperty', 'newValue');
      var value = data.get('testProperty');
      expect(value).to.equal('newValue');
    });
    it('set and get values that is an object', function () {
      var value = {
        fun: true
      };
      data.set('testProperty', value);
      expect(data.get('testProperty')).to.deep.equal(value);
    });
  });
  describe('watch', function () {
    it('call listeners when value changes', function (done) {
      data.set('testProperty', 'oldValue');
      data.watch('testProperty', function (prop, oldValue, currentValue) {
        expect(prop).to.equal('testProperty');
        expect(oldValue).to.equal('oldValue');
        expect(currentValue).to.equal('newValue');
        done();
      });
      // trigger watch callback
      data.set('testProperty', 'newValue');
    });

    it('call listeners when object changes', function (done) {
      var data1 = {
        test: true
      };
      var data2 = {
        test: false
      };

      data.set('testProperty', data1);
      data.watch('testProperty', function () {
        done();
      });
      data.set('testProperty', data2);

    });
  });
});
