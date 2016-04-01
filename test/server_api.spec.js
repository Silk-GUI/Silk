var rewire = require('rewire'),
    path   = require('path'),
    expect = require('chai').expect;

global.__root = path.resolve(__dirname, '../');

var serverApi = rewire('../core/fork_framework/server_api.js');
var apiData = require('../core/api_data.js');

describe('server_api', function () {
  var message;

  describe('call', function () {

    beforeEach(function () {
      message = {
        type: 'get',
        message: {
          data: null,
          method: 'test',
          id: 1
        }
      };

    });

    it('should run method', function (done) {
      var reset = serverApi.__set__('serverAPI', {
        'test': function () {
          return true;
        }
      });

      var fork = {
        send: function (message) {
          expect(message.cmd).to.equal('server api');
          expect(message.message.id).to.equal(1);
          expect(message.message.result).to.equal(true);
          expect(message.message.error).to.equal(undefined);
          reset();
          done();
        }
      };

      serverApi.call(message, fork);
    });

    it('should handle error in method', function (done) {
      var reset = serverApi.__set__('serverAPI', {
        'test': function () {
          throw new Error('test');
        }
      });

      var fork = {
        send: function (message) {
          expect(message.cmd).to.equal('server api');
          expect(message.message.id).to.equal(1);
          expect(message.message.error.message).to.equal('test');
          expect(message.message.result).to.equal(undefined);
          done();
        }
      };

      serverApi.call(message, fork);
    });
  });
  describe('methods', function () {
    describe('apps/list', function (done2) {
      it('should send updates to listeners', function (done) {

        var data = [{ 'abc': 'xyz' }, { test: true }];
        apiData.set('apps/clean', data);

        message.type = 'listener';

        var result = serverApi.methods['apps/list'](null, message, function (err, result) {
          console.log('finished');

          expect(result).to.equal(data);
          done();
        });

        // expect(result).to.equal(data);

        data[0] = { 'abc': 'test' };
        console.log(data);
        apiData.set('apps/clean', data);
      });
    });
  });
});
