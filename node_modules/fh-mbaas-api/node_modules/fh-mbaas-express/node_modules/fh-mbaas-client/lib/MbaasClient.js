var url = require('url');
var app = require('./app/app.js');
var admin = require('./admin/admin');
var proxy = require('./proxy');

/**
 * Create a new instance of MbaasClient
 * @param envId the id of the environment
 * @param mbaasConf the mbaas configuration
 * @constructor
 */
function MbaasClient(envId, mbaasConf) {
  this.envId = envId;
  this.mbaasConfig = mbaasConf;
  this.setMbaasUrl();
  this.app = {};
  this.admin = {};
  proxy(this.app, app, this.mbaasConfig);
  proxy(this.admin, admin, this.mbaasConfig);
}

MbaasClient.prototype.setMbaasUrl = function() {
  if (this.mbaasConfig.fhMbaasHost) {
    // explicity told what the url is, no /api/mbaas/ replace needed
    this.mbaasConfig.__mbaasUrl = this.mbaasConfig.fhMbaasHost;
  } else {
    var parsedMbaasUrl = url.parse(this.mbaasConfig.url);
    parsedMbaasUrl.host = parsedMbaasUrl.host.replace("api.", "mbaas.");
    this.mbaasConfig.__mbaasUrl = parsedMbaasUrl.format();
  }
};

MbaasClient.prototype.getMbaasConf = function() {
  return this.mbaasConfig;
};

module.exports = MbaasClient;