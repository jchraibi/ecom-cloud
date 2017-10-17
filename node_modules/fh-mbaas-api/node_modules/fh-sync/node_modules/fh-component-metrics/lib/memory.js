var os = require('os');
var types = require('./types');
var alreadySendingToKey = {};
var _ = require('lodash');

module.exports = function(metricsClients, baseTags) {

  function getHeap() {
    var mem = process.memoryUsage();
    var heapUsedKey = 'heapUsed';
    var heapTotalKey = 'heapTotal';
    var rssKey = 'rss';

    var usage = {};
    usage[heapUsedKey] = mem.heapUsed;
    usage[heapTotalKey] = mem.heapTotal;
    usage[rssKey] = mem.rss;
    return usage;
  }

  return function memory(component, opts, cb) {
    var key = component +  '_memory';
    var workerId = process.env.metricsId || 'master';
    if (alreadySendingToKey[key + workerId]) {
      cb('Already sending ' + workerId + ' to ' + key);
    } else {
      alreadySendingToKey[key + workerId] = true;
      var interval = opts.interval || 3000;
      setInterval(function() {
        var data = {};
        data.type = types.G;
        data.key = key;
        data.tags = _.assign({
          hostname: os.hostname(),
          workerId: workerId
        }, baseTags);
        data.fields = getHeap();
        data.timestamp = Date.now();
        metricsClients.send.call(metricsClients, data);
        if ('function' === typeof cb) {
          cb(null, data);
        }
      }, interval);
    }
  };
};
