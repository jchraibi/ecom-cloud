var dgram = require('dgram');
var util = require('util');
var BaseClient = require('./base');
var _ = require('lodash');

/**
 * A client that can send data to Influxdb backend via UDP
 * @param {Object} opts options about the influxdb backend
 * @param {String} opts.host the host of the influxdb. Default is 127.0.0.1
 * @param {Number} opts.port the port of the UDP port of influxdb. Default is 4444.
 * @param {Number} opts.sendQueueConcurrency specify the concurrency when send data to influxdb. Default is 10.
 */
var InfluxUdp = function influxUdp(opts) {
  BaseClient.apply(this, arguments);
  opts = opts || {};
  this.host = opts.host || '127.0.0.1';
  this.port = opts.port || 4444;
  this.socket = dgram.createSocket('udp4');
};

util.inherits(InfluxUdp, BaseClient);

//keys or tag keys & values need to escapce space and comma
function escapeKey(value) {
  if (_.isString(value)) {
    return value.replace(/([,\s=])/g, '\\$1');
  } else {
    return value;
  }
}

function escapeField(value) {
  if (_.isString(value)) {
    //string need to be wrapped in '"'
    return '"' + value.replace(/(["=])/g, '\\$1') + '"';
  } else {
    return value;
  }
}

//use line protocol to send the data via UDP, see https://docs.influxdata.com/influxdb/v0.10/write_protocols/line/
InfluxUdp.prototype.buildMessages = function(data) {
  var keys = [];
  var fields = [];
  if (data.key) {
    keys.push(escapeKey(data.key));
  }
  if (data.tags) {
    var tagKeys = _.chain(data.tags).keys().sortBy().value();
    _.each(tagKeys, function(tagKey) {
      if (data.tags[tagKey]) {
        keys.push(escapeKey(tagKey) + '=' + escapeKey(data.tags[tagKey] + ''));
      }
    });
  }
  _.each(data.fields, function(value, key) {
    fields.push(escapeKey(key) + '=' + escapeField(value));
  });
  var message = [keys.join(','), fields.join(',')];
  if (data.timestamp) {
    message.push(data.timestamp*1e6); //it has to be nano seconds
  }
  return [message.join(' ') + '\n'];
};

InfluxUdp.prototype.transport = function(message, options, cb) {
  message = new Buffer(message);
  this.socket.send(message, 0, message.length, this.port, this.host, cb);
};

//each module should export an `init` method, and when invoked, it should return an object that has a `send` method
module.exports = {
  init: function(influxConf) {
    return new InfluxUdp(influxConf);
  }
};