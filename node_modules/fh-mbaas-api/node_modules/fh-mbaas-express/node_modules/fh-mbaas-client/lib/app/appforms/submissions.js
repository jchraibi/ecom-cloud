var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');


/**
 * Listing Submissions Associated With A Project
 */
function list(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}

/**
 * Getting A Single Submission Associated With A Project
 */
function get(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/:id", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}

/**
 * Upload A File Associated With A Submission
 */
function uploadSubmissionFile(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/:id/fields/:fieldId/files/:fileId", params);
  var method = "POST";
  var data = params.fileDetails;

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  //Flagging This Request As A File Request
  params.fileRequest = true;
  params.fileUploadRequest = true;

  mbaasRequest.app(params, cb);
}

function uploadSubmissionFileBase64(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/:id/fields/:fieldId/files/:fileId/base64", params);
  var method = "POST";
  var data = params.fileDetails;

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  //Flagging This Request As A File Request
  params.fileRequest = true;
  params.fileUploadRequest = true;

  mbaasRequest.app(params, cb);
}

/**
 * Get The Current Status Of A Submission
 */
function getSubmissionStatus(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/:id/status", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  //Flagging This Request As A File Request
  params.fileRequest = true;

  mbaasRequest.app(params, cb);
}


/**
 * Verify Submission And Mark As Complete
 */
function completeSubmission(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/:id/complete", params);
  var method = "POST";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}


/**
 * Get A File Contained In A Submission For An Environment
 *
 * This will return a request object that can be piped elsewhere according tothe user
 *
 * @param params
 * @param cb
 */
function getSubmissionFile(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/files/:fileId", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  //Flagging This Request As A File Request
  params.fileRequest = true;

  return mbaasRequest.app(params, cb);
}

/**
 * Allows Users To Search For Submissions By FormId Or An Array Of Submission Ids
 * @param params
 * @param cb
 * @returns {*}
 */
function search(params, cb) {
  params = params || {};
  var resourcePath = config.addURIParams("/appforms/submissions/search");
  var method = "POST";
  var data = params.searchParams;

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  return mbaasRequest.app(params, cb);
}

/**
 * Export Submissions As A Zip File Containing CSVs.
 * @param params
 * @param cb
 */
function exportCSV(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/export", params);
  var method = "POST";
  var data = params.queryParams;

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  params.fileRequest = true;

  mbaasRequest.app(params, cb);
}

/**
 * Getting A PDF Of A Submission
 * @param params
 * @param cb
 */
function exportSinglePDF(params, cb) {
  var resourcePath = config.addURIParams("/appforms/submissions/:id/exportpdf", params);
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  params.fileRequest = true;

  mbaasRequest.app(params, cb);
}

module.exports = {
  list: list,
  get: get,
  search: search,
  getFile: getSubmissionFile,
  uploadFile: uploadSubmissionFile,
  uploadFileBase64: uploadSubmissionFileBase64,
  status: getSubmissionStatus,
  complete: completeSubmission,
  exportSinglePDF: exportSinglePDF,
  exportCSV: exportCSV
};