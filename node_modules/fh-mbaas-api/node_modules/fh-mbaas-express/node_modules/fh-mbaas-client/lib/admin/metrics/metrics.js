var mbaasRequest = require('../../mbaasRequest/mbaasRequest.js');
var config = require('../../config/config.js');
var constants = require('../../config/constants.js');


function getMetrics(params,cb) {
  params.resourcePath = config.addURIParams(constants.METRICS_BASE_PATH, params);
  params.method = 'GET';
  params.data = params.data || {};
  mbaasRequest.admin(params, cb);
}

module.exports ={
  "getMetrics":getMetrics
};
