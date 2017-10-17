var util = require('util');
module.exports = function(config) {
  var BASE_ERROR = "invalid config expected %s";
  var backends = [];
  if (config.backends) {
    backends = config.backends;
  } else if (config.host) {
    //keep it backward compatible
    backends = [{type: 'influxdb', host: config.host, port: config.port}];
  }
  return {
    "getConfig": function() {
      return backends;
    },
    "getHost": function() {
      if (!config || !config.host) {
        throw new Error(util.format(BASE_ERROR, "host"));
      }
      return config.host;
    },
    "getPort": function() {
      if (! config || ! config.port) {
        throw new Error(util.format(BASE_ERROR, "port"));
      }
      return config.port;
    },
    "getBaseTags": function() {
      if (config.baseTags && typeof config.baseTags === 'object') {
        return config.baseTags;
      } else {
        return {};
      }
    },
    "enabled": function() {
      return (config.enabled === true || config.enabled === 'true') && backends.length > 0;
    }
  };
};
