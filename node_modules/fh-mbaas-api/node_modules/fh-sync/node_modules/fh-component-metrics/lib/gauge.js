var os = require('os');
var types = require('./types');
var _ = require('lodash');

module.exports = function(metricsClients, type, baseTags) {

  return function(key, tag, value, cb) {
    var data = {};
    //the type of the metric
    data.type = type || types.G;
    data.key = key;
    data.tags = _.assign({hostname: os.hostname(), workerId: process.env.metricsId || 'master'}, baseTags, tag || {});
    data.fields = {value: value};
    data.timestamp = Date.now();
    metricsClients.send.call(metricsClients, data);

    if ('function' === typeof cb) {
      cb(null, data);
    }
  };
};
