var rewire = require('rewire');
var expect = require('chai').expect;
var __root = global.__root = require('../root.js'); // eslint-disable-line no-unused-vars
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
        test: function () {
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
      var fork;

      serverApi.__set__('serverAPI', {
        test: function () {
          throw new Error('test');
        }
      });

      fork = {
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
    describe('apps/list', function () {
      it('should send updates to listeners', function (done) {
        var data = [{ abc: 'xyz' }, { test: true }];

        apiData.set('apps/clean', data);

        message.type = 'listener';

        serverApi.methods['apps/list'](null, message, function (err, result) {
          expect(result).to.equal(data);
          done();
        });

        data[0] = { abc: 'test' };
        apiData.set('apps/clean', data);
      });
    });
  });
  describe('electron events', function () {
    it('should notify listeners', function (done) {
      var origData = { window: 1, app: 'path', name: 'minimize', data: 'true' };
      serverApi.methods['electron/windowRawEvents'](null, message, function (err, data) {
        expect(err).to.be.null;
        expect(data).to.equal(data);
        done();
      });
      serverApi.electronMessage(origData);
    });
  });
});
