var gauge = require('./gauge');
var types = require('./types');

module.exports = function(metricsClients, baseTags) {

  var g = gauge(metricsClients, types.T, baseTags);

  return function(key, tags, value, cb) {
    g(key, tags, value, cb);
  };
};