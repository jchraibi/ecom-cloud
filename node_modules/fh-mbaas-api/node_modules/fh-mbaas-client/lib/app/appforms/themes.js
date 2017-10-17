var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');

/**
 * Get The Theme Associated With A Project
 */
function get(params, cb) {
  var resourcePath = config.addURIParams("/appforms/themes", params);
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