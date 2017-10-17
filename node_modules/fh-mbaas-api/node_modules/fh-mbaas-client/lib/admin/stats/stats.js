var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');


/**
 * Stats history post request to an MBaaS
 * @param params
 * @param cb
 */
function history(params, cb) {
  params.resourcePath = config.addURIParams(constants.STATS_BASE_PATH + "/history", params);
  params.method = 'POST';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

//
// Expose the implementation
//
module.exports = {
  history: history
};
