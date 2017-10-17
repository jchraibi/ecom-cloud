var config = require('../../config/config.js');
var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var constants = require('../../config/constants.js');

function create(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/apps", params);
  params.method = "POST";
  params.data = params.projectDetails;

  mbaasRequest.admin(params, cb);
}

function update(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/apps/:id", params);
  params.method = "PUT";
  params.data = params.projectDetails;

  mbaasRequest.admin(params, cb);
}

function updateConfig(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/apps/:id/config", params);
  params.method = "PUT";
  params.data = params.projectConfig;

  mbaasRequest.admin(params, cb);
}

function remove(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/apps/:id", params);
  params.method = "DELETE";
  params.data = {};

  mbaasRequest.admin(params, cb);
}

function importProjects(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/apps/import", params);
  params.method = "POST";
  params.data = params.projectDetails;

  mbaasRequest.admin(params, cb);
}

function importProjectConfig(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/apps/config/import", params);
  params.method = "POST";
  params.data = params.config;

  mbaasRequest.admin(params, cb);
}


module.exports = {
  importProjects: importProjects,
  importProjectConfig: importProjectConfig,
  create: create,
  update: update,
  updateConfig: updateConfig,
  remove: remove
};