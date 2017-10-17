var util = require('util');
var BaseClient = require('./base');

function buildRedisKey(namespace, metricName) {
  return [namespace, metricName].join(':');
}

/**
 * A client that can send metrics data to a redis backend
 * @param {Object} opts
 * @param {Object} opts.redisClient an instance of the redis nodejs client.
 * @param {Number} opts.recordsToKeep the number of records to keep for each metric. Default is 1000.
 * @param {String} opts.namespace name space for each metric key. It will be used to prefix each metric key followed by ':'. Default is `stats`. So each metric key will be like `stats:<metric key>`.
 */
function RedisClient(opts) {
  opts = opts || {};
  BaseClient.apply(this, arguments);
  this.recordsToKeep = opts.recordsToKeep || 1000;
  this.namespace = opts.namespace || 'stats';
  this.client = opts.redisClient;
}

util.inherits(RedisClient, BaseClient);

RedisClient.prototype.buildMessages = function(data) {
  return [data];
};

RedisClient.prototype.transport = function(message, options, cb) {
  var self = this;
  var valueToSave = {
    tags: message.tags,
    fields: message.fields,
    ts: message.timestamp
  };
  var redisKey = buildRedisKey(self.namespace, message.key);
  this.client.multi([
    ['lpush', redisKey, JSON.stringify(valueToSave)],
    ['ltrim', redisKey, 0, self.recordsToKeep - 1]
  ]).exec(cb);
};

module.exports = {
  init: function(redisConfig) {
    return new RedisClient(redisConfig);
  }
};