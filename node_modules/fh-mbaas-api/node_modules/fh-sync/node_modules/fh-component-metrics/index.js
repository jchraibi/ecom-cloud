var MetricsClients = require('./lib/clients');
var types = require('./lib/types');

module.exports = function metrics(conf) {
  //configure config module
  var config = require('./lib/config')(conf);
  var confEnabled = config.enabled();
  var clients = new MetricsClients(config.getConfig());
  var baseTags = config.getBaseTags();
  var counter = require('./lib/counter')(clients, baseTags);
  var nothing = function() {};

  return {
    "cpu": confEnabled ? require('./lib/cpu')(clients, baseTags) : nothing,
    "memory": confEnabled ? require('./lib/memory')(clients, baseTags) : nothing,
    "gauge": confEnabled ? require('./lib/gauge')(clients, types.G, baseTags) : nothing,
    "inc": confEnabled ? counter.inc : nothing,
    "dec": confEnabled ? counter.dec : nothing,
    "timer": confEnabled ? require('./lib/timer')(clients, baseTags) : nothing
  };
};

module.exports.timingMiddleware = require('./lib/timingMiddleware');