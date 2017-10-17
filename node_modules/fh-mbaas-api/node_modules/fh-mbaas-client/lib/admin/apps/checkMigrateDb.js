var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * Checking the status of a DB Migrate in the MBaaS
 * @param params
 * @param cb
 */
module.exports = function(params, cb) {
  params.resourcePath = config.addURIParams(constants.APPS_BASE_PATH + "/checkmigratedb", params);
  params.method = "POST";
  params.data = params.data || {};

  mbaasRequest.admin(params, cb);
};

