var gauge = require('./gauge');
var types = require('./types');
var MetricsClients = require('./clients');
var _ = require('lodash');

module.exports = function timingMiddlewareCreator(component, metrics_conf) {
  var config = require('./config')(metrics_conf);
  var metricsEnabled = config.enabled();
  var clients = metricsEnabled ? new MetricsClients(config.getConfig()) : null;
  var timeFunc = metricsEnabled ? gauge(clients, types.T, config.getBaseTags()) : null;

  return function timingMiddleware(req, res, next) {
    if (metricsEnabled) {
      var start = process.hrtime();
      res.on('finish', function timingMiddlewareFinishListener() {
        var hrTime = process.hrtime(start);
        var millisecondsTaken = (hrTime[0] * 1000) + (hrTime[1] / 1000000);

        var route = req.permissionpath || req.route || req.path || req.url;
        if (_.isObject(route)) {
          route = route.path;
        }
        if ('string' === typeof route) {
          timeFunc(component + '_api_timing', {route: route}, millisecondsTaken);
        } else {
          /*eslint-disable no-console */
          console.error("failed to determine route cannot gauge timing : fh-component-metrics");
        }
      });
      return next();
    } else {
      return next();
    }
  };
};
