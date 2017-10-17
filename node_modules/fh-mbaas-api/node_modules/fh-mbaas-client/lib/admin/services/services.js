var config = require('../../config/config.js');
var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var constants = require('../../config/constants.js');
/**
 * Deploying A Service Definition To An Mbaas.
 *
 * @param params
 * @param cb
 */
function deploy(params, cb) {
  params.resourcePath = config.addURIParams(constants.SERVICES_BASE_PATH + "/:guid/deploy", params);
  params.method = "POST";
  params.data = params.service;

  mbaasRequest.admin(params, cb);
}

/**
 * Listing All Services Details Deployed To An Mbaas
 *
 * @param params
 * @param cb
 */
function list(params, cb) {
  params.resourcePath = config.addURIParams(constants.SERVICES_BASE_PATH, params);
  params.method = "GET";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * Getting A Single Service Details From An Mbaas
 *
 * @param params
 * @param cb
 */
function get(params, cb) {
  params.resourcePath = config.addURIParams(constants.SERVICES_BASE_PATH + "/:guid", params);
  params.method = "GET";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * Removing A Service From The MBaaS
 * @param params
 * @param cb
 */
function remove(params, cb) {
  params.resourcePath = config.addURIParams(constants.SERVICES_BASE_PATH + "/:guid", params);
  params.method = "DELETE";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

module.exports = {
  deploy: deploy,
  list: list,
  get: get,
  remove: remove
};