var mbaasRequest = require('../mbaasRequest/mbaasRequest.js');
var config = require('../config/config.js');

/**
 * Create an Event in the MBaaS
 */
function databaseConnectionString(params, cb) {
  var resourcePath = config.addURIParams("/dbconnection", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}

module.exports = databaseConnectionString;
