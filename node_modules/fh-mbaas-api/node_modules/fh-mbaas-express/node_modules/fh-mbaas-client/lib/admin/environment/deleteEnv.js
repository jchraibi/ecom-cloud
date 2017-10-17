var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * Calls to the delete environment endpoint in the mbaas.
 * @param params.domain {string} the current domain
 * @param params.environment {string} the current environment
 * @param cb
 */
module.exports = function deleteEnv(params, cb) {
  params.resourcePath = config.addURIParams(constants.ENVIROMEMTS_BASE_PATH, params);
  params.method = "DELETE";
  params.data = params.data || {};

  mbaasRequest.admin(params, cb);
};

