var BaseClient = require('./base');
var util = require('util');
var types = require('../types');
var _ = require('lodash');
var dgram = require('dgram');

var STATS_TYPES = {};
STATS_TYPES[types.C] = 'c';
STATS_TYPES[types.G] = 'g';
STATS_TYPES[types.T] = 'ms';

var KEY_DELIMITER = "-";

function sanitizeInput(input) {
  //Replace characters that may cause problems here (:| are used by statsd, and cannot be included in the name)
  return (input + '').replace(/[\s:|=<.]+/g, '');
}

//a default implementation to format the meta data into the name of the metric
//We will embed tags into the key. Each message will be constructed like this:
// <key>-<tagKey>_is_<tagValue>...-<fieldName>:<fieldValue>|<type>
// For example, given this data:
// {type: 'gauge', key: 'memory', tags: {host: localhost, workerId:1}, fields: {used: 800, total: 1000}}
// it will be converted to:
// ['memory-host_is_localhost-workerId_is_1-used:800|g', 'memory-host_is_localhost-workerId_is_1-total:1000|g']
function defaultMetricsKeyBuilder(keyField, tagsFields, fieldName) {
  var keys = [];
  //the key field first
  if (keyField) {
    keys.push(keyField);
  }
  //then tags. statsd doesn't really support tags, so we just add them as part of the key.
  if (tagsFields) {
    var tags = _.map(tagsFields, function(tagValue, tagKey) {
      return tagKey + '_is_' + tagValue; //see https://github.com/vimeo/carbon-tagger
    });
    keys = keys.concat(tags);
  }
  //then the field name
  keys.push(fieldName);
  return keys.join(KEY_DELIMITER);
}

/**
 * A client that can send metrics data to a statsd backend
 * @param {Object} opts options about the statsd backend
 * @param {String} opts.host the host of the statsd server. Default is 127.0.0.1.
 * @param {Number} opts.port the port of the statsd server. Default is 8125.
 * @param {Function} opts.keyBuilder a function that will be used to format the meta data of a metric into a single key value. The signature of function is like this: function(key, tags, fieldName)
 */
function StatsdClient(opts) {
  BaseClient.apply(this, arguments);
  opts = opts || {};
  this.host = opts.host || '127.0.0.1';
  this.port = opts.port || 8125;
  this.keyBuilder = opts.keyBuilder || defaultMetricsKeyBuilder;
  this.socket = dgram.createSocket('udp4');
}

util.inherits(StatsdClient, BaseClient);

//statsd only allows one value per message. If the data contains multiple fields, each of the field will be converted to a message
StatsdClient.prototype.buildMessages = function(data) {
  var self = this;
  var statsIdentifier = STATS_TYPES[data.type] || 'g';
  if (data.fields) {
    //each field value will be mapped to a message
    var messages = _.map(data.fields, function(fieldValue, fieldName) {
      var key = sanitizeInput(self.keyBuilder(data.key, data.tags, fieldName));
      return key + ':' + fieldValue + '|' + statsIdentifier;
    });
  }
  return messages;
};

StatsdClient.prototype.transport = function(message, options, cb) {
  message = new Buffer(message);
  this.socket.send(message, 0, message.length, this.port, this.host, cb);
};

module.exports = {
  init: function(statsdConfig) {
    return new StatsdClient(statsdConfig);
  }
};

