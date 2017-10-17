var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');


/**
 * Listing forms for a project
 */
function list(params, cb) {
  var resourcePath = config.addURIParams("/appforms/forms", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}


/**
 * Getting A Form Associated With A Project
 */
function get(params, cb) {
  var resourcePath = config.addURIParams("/appforms/forms/:id", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}

/**
 * Making A Submisison Against A Form
 */
function submitFormData(params, cb) {
  var resourcePath = config.addURIParams("/appforms/forms/:id/submitFormData", params);
  var method = "POST";
  var data = params.submission;

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}


/**
 * Search For Forms Based On Ids. This will return fully populated forms
 * @param params
 * @param cb
 */
function search(params, cb) {
  var resourcePath = config.addURIParams("/appforms/forms/search", params);
  var method = "POST";
  var data = params.searchParams;

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}


module.exports = {
  list: list,
  get: get,
  search: search,
  submitFormData: submitFormData
};