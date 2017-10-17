var constants = require('./config/constants');
var _ = require('underscore');
/**
 * proxy the function calls in the source to the corresponding calls in the target,
 * and add the mbaasConf to the first parameter
 * @param source the object that contains the proxied functions
 * @param target the real object contains the functions that should be proxied
 * @param mbaasConf the mbaasConf that will be added to the first parameter
 */
module.exports = function proxy(source, target, mbaasConf) {
  _.each(target, function(api, key) {
    if (_.isFunction(api)) {
      source[key] = (function(func, conf) {
        return function() {
          var params = arguments[0];
          params[constants.MBAAS_CONF_KEY] = conf;
          func.apply(null, arguments);
        };
      }(api, mbaasConf));
    } else {
      if (!source[key]) {
        source[key] = {};
      }
      proxy(source[key], api, mbaasConf);
    }
  });
};

