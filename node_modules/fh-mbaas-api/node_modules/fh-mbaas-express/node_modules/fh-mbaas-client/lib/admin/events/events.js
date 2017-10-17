var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');

/**
 * Creating an Event on an MBaaS
 * @param params
 * @param cb
 */
function createEvent(params, cb) {
  params.resourcePath = config.addURIParams(constants.EVENTS_BASE_PATH, params);
  params.method = 'POST';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

/**
 * List Events on an MBaaS
 * @param params
 * @param cb
 */
function listEvents(params, cb) {
  params.resourcePath = config.addURIParams(constants.EVENTS_BASE_PATH, params);
  params.method = 'GET';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

//
// Expose the alert implementation
//
module.exports = {
  create: createEvent,
  list: listEvents
};