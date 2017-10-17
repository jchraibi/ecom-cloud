var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');

/**
 * Get The Forms App Configuration Associated With A Project
 */
function get(params, cb) {
  var resourcePath = "/appforms/config";
  var method = "GET";
  var data = {};

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}

module.exports = {
  get: get
};