"use strict";

var mbaasRequest = require('../../mbaasRequest/mbaasRequest')
  , constants = require('../../config/constants')
  , config = require('../../config/config');


/**
 * Query fh-mbaas to return a list of all (current and historic) export jobs,
 * given environment, domain and application id.
 *
 * @param params Object containing environment, appid and domain
 */
function list(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/export", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.admin(params, cb);
}

/**
 * Start a new appdata export job given domain, environment and app id
 *
 * @param params Object containing environment, appid and domain
 */
function startJob(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/export", params);
  var method = "POST";

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = {
    stopApp: params.stopApp
  };

  mbaasRequest.admin(params, cb);
}

/**
 * Get the download URL for a finished job given domain, environment andapp id. This
 * will return 404 if the job has not finished yet or does not exist.
 *
 * @param params params Object containing environment, appid and domain and job_id
 */
function downloadUrl(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/export/:job_id", params);
  var method = "POST";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.admin(params, cb);
}

/**
 * Read a whole job as JSON given domain, environment, appid and job_id.
 *
 * @param params params Object containing environment, appid and domain and job_id
 */
function read(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/export/:job_id", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.admin(params, cb);
}

module.exports = {
  list: list,
  startJob: startJob,
  downloadUrl: downloadUrl,
  read: read
};