var chai   = require('chai'),
    expect = chai.expect;
var __root = '../';
var watchData = require(__root + '/core/api_data.js');
var it = require('mocha/lib/mocha.js').it;
var beforeEach = require('mocha/lib/mocha.js').beforeEach;
var describe = require('mocha/lib/mocha.js').describe;

var data = watchData;
describe('watchData', function () {
	beforeEach(function(){
		data = new watchData();
	  });

    });
  });
});
