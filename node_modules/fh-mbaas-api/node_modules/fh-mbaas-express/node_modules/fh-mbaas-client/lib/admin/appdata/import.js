"use strict";

var mbaasRequest = require('../../mbaasRequest/mbaasRequest')
  , constants = require('../../config/constants')
  , config = require('../../config/config');

/**
 * Query fh-mbaas to return a list of all current and historic
 * import commands.
 *
 * @param params Object containing environment, appid and domain
 */
function list(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/import", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.admin(params, cb);
}

/**
 * Start a new appdata import job given domain, environment and app id
 *
 * @param params Object containing environment, appid and domain
 */
function startJob(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/import", params);
  var method = "POST";

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = {
    filename: params.filename,
    filesize: params.filesize
  };

  mbaasRequest.admin(params, cb);
}

/**
 * Read a whole job as JSON given domain, environment, appid and job_id.
 *
 * @param params params Object containing environment, appid and domain and job_id
 */
function read(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/import/:job_id", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.admin(params, cb);
}

/**
 * Get the upload URL to provide the file for a new import given domain, environment andapp id.
 *
 * @param params params Object containing environment, appid and domain and job_id
 */
function uploadUrl(params, cb) {
  var resourcePath = config.addURIParams(constants.APPDATA_BASE_PATH + "/import/:job_id", params);
  var method = "POST";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.admin(params, cb);
}

module.exports = {
  list: list,
  startJob: startJob,
  read: read,
  uploadUrl: uploadUrl
};