var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * List Notifications on an MBaaS
 * @param params
 * @param cb
 */
function listNotifications(params, cb) {

  params.resourcePath = config.addURIParams(constants.NOTIFICATIONS_BASE_PATH, params);
  params.method = 'GET';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}


//
// Expose the alert implementation
//
module.exports = {
  list: listNotifications
};