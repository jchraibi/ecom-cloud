var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * Deploying App Details To An Mbaas
 * @param params
 * @param cb
 */
module.exports = function(params, cb) {
  params.resourcePath = config.addURIParams(constants.APPS_BASE_PATH + "/migratedb", params);
  params.method = "POST";
  params.data = params.data || {};
  params.data.mbaasUrl = params[constants.MBAAS_CONF_KEY].__mbaasUrl;

  mbaasRequest.admin(params, cb);
};

