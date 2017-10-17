var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * Test Alert Emails on an MBaaS
 * @param params
 * @param cb
 */
function testEmails(params, cb) {
  params.resourcePath = config.addURIParams(constants.ALERTS_BASE_PATH + '/testEmails', params);
  params.method = 'POST';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

/**
 * Creating an Alert on an MBaaS
 * @param params
 * @param cb
 */
function createAlert(params, cb) {
  params.resourcePath = config.addURIParams(constants.ALERTS_BASE_PATH, params);
  params.method = 'POST';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

/**
 * Updating an Alert on an MBaaS
 * @param params
 * @param cb
 */
function updateAlert(params, cb) {

  params.resourcePath = config.addURIParams(constants.ALERTS_BASE_PATH + '/:id', params);
  params.method = 'PUT';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

/**
 * Deleting an Alert on an MBaaS
 * @param params
 * @param cb
 */
function deleteAlert(params, cb) {
  params.resourcePath = config.addURIParams(constants.ALERTS_BASE_PATH + '/:id', params);
  params.method = 'DELETE';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

/**
 * List Alerts on an MBaaS
 * @param params
 * @param cb
 */
function listAlerts(params, cb) {
  params.resourcePath = config.addURIParams(constants.ALERTS_BASE_PATH, params);
  params.method = 'GET';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}


//
// Expose the alert implementation
//
module.exports = {
  create: createAlert,
  update: updateAlert,
  "delete": deleteAlert,
  list: listAlerts,
  testEmails: testEmails
};
