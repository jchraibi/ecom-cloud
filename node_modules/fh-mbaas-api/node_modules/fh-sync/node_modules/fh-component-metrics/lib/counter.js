var gauge = require('./gauge');
var types = require('./types');

module.exports = function(metricsClients, baseTags) {

  var g = gauge(metricsClients, types.C, baseTags);

  return {
    'inc': function(key, tags, cb) {
      g(key, tags, 1, cb);
    },
    'dec': function(key, tags, cb) {
      g(key, tags, -1, cb);
    }
  };
};