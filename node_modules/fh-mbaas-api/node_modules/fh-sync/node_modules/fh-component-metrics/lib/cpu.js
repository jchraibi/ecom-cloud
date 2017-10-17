var fs = require('fs');
var os = require('os');
var types = require('./types');
var _ = require('lodash');

// http://stackoverflow.com/a/7774034/2829381
var getUsage = function(cb) {
  fs.readFile("/proc/" + process.pid + "/stat", function(err, data) {
    if (err) {
      return cb(err);
    }
    var timeOfRead = Date.now();

    var elems = data.toString().split(' ');
    var utime = parseInt(elems[13]);
    var stime = parseInt(elems[14]);

    cb(undefined, utime + stime, timeOfRead);
  });
};

var checkInterval = {};

module.exports = function(metricsClients, baseTags) {

  return function cpu(component, opts, cb) {
    var key = component + '_cpu';
    var seriesName = 'cpuUsed';
    var workerId = process.env.metricsId || 'master';
    var cacheKey = key + seriesName + workerId;
    if (opts.stop) {
      if (checkInterval[cacheKey]) {
        clearInterval(checkInterval[cacheKey]);
        delete checkInterval[cacheKey];
      }
      return cb();
    }
    var usageFunc = opts.getUsage ? opts.getUsage : getUsage;
    var handleError = function(err) {
      if ('function' === typeof cb) {
        return cb(err);
      }
    };

    if (checkInterval[cacheKey]) {
      cb('Already sending ' + seriesName + ' to ' + key);
    } else {
      var interval = opts.interval || 2000; // how often to poll
      var period = opts.period || 1000; // period to measure

      checkInterval[cacheKey] = setInterval(function() {
        usageFunc(function(err, startTime, startTimeOfRead) {
          if (err) {
            return handleError(err);
          }
          setTimeout(function() {
            usageFunc(function(err, endTime, endTimeOfRead) {
              if (err) {
                return handleError(err);
              }
              var proctime = endTime - startTime;

              // The actual sample period may not match the configured period,
              // particularly if the process is blocked for longer than the period.
              // To ensure accurate results, calculate percentage cpu usage
              // over time between both sample reads.
              var secondsBetweenReads = (endTimeOfRead - startTimeOfRead) / 1000;
              var percentage = 100 * (proctime / (10000 * secondsBetweenReads));

              var point = {};
              point[seriesName] = percentage;

              var data = {};
              data.type = types.G;
              data.key = key;
              data.tags = _.assign({
                hostname: os.hostname(),
                workerId: workerId
              }, baseTags);
              data.fields = point;
              data.timestamp = Date.now();

              metricsClients.send.call(metricsClients, data);
              if ('function' === typeof cb) {
                cb(null, data);
              }
            });
          }, period);
        });
      }, interval);
    }
  };
};
