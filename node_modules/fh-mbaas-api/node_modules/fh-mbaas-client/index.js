var logger = require('./lib/logger/logger.js');

var MbaasClient = require('./lib/MbaasClient');
var client = null;

module.exports = {
  setLogger: logger.setLogger,
  //Deprecated, try not to use it. Use MbaasClient instead.
  initEnvironment: function(environment, mbaasConfig) {
    if (!client) {
      client = new MbaasClient(environment, mbaasConfig);
    }
    //Deprecated
    module.exports.app = client.app;
    module.exports.admin = client.admin;
  },
  MbaasClient: MbaasClient
};