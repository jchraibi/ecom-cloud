var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * Deploying App Details To An Mbaas
 * @param params
 * @param cb
 */
function remove(params, cb) {
  params.resourcePath = config.addURIParams(constants.APPS_BASE_PATH, params);
  params.method = "DELETE";
  params.data = params.data || {};

  mbaasRequest.admin(params, cb);
}

module.exports = remove;

