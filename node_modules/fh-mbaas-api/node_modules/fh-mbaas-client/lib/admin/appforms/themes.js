var config = require('../../config/config.js');
var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var constants = require('../../config/constants.js');


function create(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/themes", params);
  params.method = "POST";
  params.data = params.theme;

  mbaasRequest.admin(params, cb);
}

function deploy(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/themes/:id/deploy", params);
  params.method = "POST";
  params.data = params.theme;

  mbaasRequest.admin(params, cb);
}

function update(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/themes/:id", params);
  params.method = "PUT";
  params.data = params.theme;

  mbaasRequest.admin(params, cb);
}


function remove(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/themes/:id", params);
  params.method = "DELETE";
  params.data = params.theme;

  mbaasRequest.admin(params, cb);
}

function importThemes(params, cb) {
  params.resourcePath = config.addURIParams(constants.FORMS_BASE_PATH + "/themes/import", params);
  params.method = "POST";
  params.data = params.themes;

  mbaasRequest.admin(params, cb);
}


module.exports = {
  importThemes: importThemes,
  create: create,
  update: update,
  remove: remove,
  deploy: deploy
};