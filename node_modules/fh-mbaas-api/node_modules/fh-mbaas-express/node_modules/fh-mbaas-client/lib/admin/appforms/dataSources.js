var config = require('../../config/config.js');
var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var constants = require('../../config/constants.js');

/**
 * Get A Single Data Source From An Environment
 * @param params
 * @param cb
 */
function get(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/:id", params);
  params.method = "GET";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * List All Data Sources On An Environment
 * @param params
 * @param cb
 */
function list(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources", params);
  params.method = "GET";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * Deploy A Data Source To An Environment
 * @param params
 * @param cb
 */
function deploy(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/:id/deploy", params);
  params.method = "POST";
  params.data = params.dataSource;

  mbaasRequest.admin(params, cb);
}

/**
 * Validate A Data Source In An Environment
 * @param params
 * @param cb
 */
function validate(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/validate", params);
  params.method = "POST";
  params.data = params.dataSource;

  mbaasRequest.admin(params, cb);
}

/**
 * Force A Refresh For A Data Source For An Environment
 * @param params
 * @param cb
 */
function refresh(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/:id/refresh", params);
  params.method = "POST";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * Remove A Data Source From An Environment
 * @param params
 * @param cb
 */
function remove(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/:id", params);
  params.method = "DELETE";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * Get A Data Source Including Audit Logs
 * @param params
 *  - id: Data Source ID
 *  - environment: Environment ID
 *  - domain: Domain To Make The Request Against
 * @param cb
 */
function getAuditLogs(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/:id/audit_logs", params);
  params.method = "GET";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

/**
 * Get A Single Data Source Audit Log Entry
 * @param params
 *  - id: Audit Log ID
 *  - environment: Environment ID
 *  - domain: Domain To Make The Request Against
 * @param cb
 */
function getAuditLogEntry(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/data_sources/audit_logs/:id", params);
  params.method = "GET";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

module.exports = {
  list: list,
  get: get,
  deploy: deploy,
  validate: validate,
  refresh: refresh,
  remove: remove,
  getAuditLogs: getAuditLogs,
  getAuditLogEntry: getAuditLogEntry
};
