var chai = require('chai'),
	expect = chai.expect;
var __root = '../';
var watchData = require(__root + '/core/watch_data.js');
var data;
describe('watchData', function () {
	beforeEach(function(){
		data = new watchData();
	  });

	describe('get and set', function () {
		it('should be able to set and get a property', function (){
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
			data.set('testProperty',  value);
			expect(data.get('testProperty')).to.deep.equal(value);
		});
	});
	describe('watch', function (done) {
		it('call listeners when value changes', function () {
			data.set('testProperty', 'oldValue');
			data.watch('testProperty', function(prop, oldValue, currentValue){
				expect(prop).to.equal('testProperty');
				expect(oldValue).to.equal('oldValue');
				expect(currentValue).to.equal('newValue');
			});
			// trigger watch callback
			data.set('testProperty', 'newValue');
		});
	});
});