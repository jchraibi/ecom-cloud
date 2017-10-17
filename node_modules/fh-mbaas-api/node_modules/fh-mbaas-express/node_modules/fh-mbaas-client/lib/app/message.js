var mbaasRequest = require('../mbaasRequest/mbaasRequest.js');
var config = require('../config/config.js');

/**
 * Create an Event in the MBaaS
 */
function sendBatch(params, cb) {

  var resourcePath = config.addURIParams("/message/:topic", params);
  var method = "POST";

  // /api/app/:domain/:environment/:projectid/:appid/message/:topic

  params.resourcePath = resourcePath;
  params.method = method;

  mbaasRequest.app(params, cb);
}

module.exports = {
  sendbatch: sendBatch
};
