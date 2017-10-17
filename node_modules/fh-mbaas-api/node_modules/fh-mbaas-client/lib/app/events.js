var mbaasRequest = require('../mbaasRequest/mbaasRequest.js');
var config = require('../config/config.js');

/**
 * Create an Event in the MBaaS
 */
function createEvent(params, cb) {
  var resourcePath = config.addURIParams("/events", params);
  var method = "POST";
  var data = {
    uid: params.guid,
    timestamp: (new Date().toISOString()),
    details: params.data.msg,
    eventClass: 'APP_STATE',
    eventType: params.data.type,
    eventLevel: 'FATAL',
    env: params.environment,
    domain: params.domain,
    dyno: '',
    appName: params.appname,
    updateBy: ''
  };

  params.resourcePath = resourcePath;
  params.method = method;
  params.data = data;

  mbaasRequest.app(params, cb);
}

module.exports = {
  create: createEvent
};