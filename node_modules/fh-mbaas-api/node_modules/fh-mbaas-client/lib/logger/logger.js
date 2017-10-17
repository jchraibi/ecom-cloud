var fhLogger = require('fh-logger');

var log = {};

module.exports = {
  setLogger: function(newLogger) {
    log.logger = newLogger;
  },
  getLogger: function() {
    if (!log.logger) {
      log.logger = fhLogger.createLogger({
        name: 'basic-logger',
        level: 'error',
        src: true
      });
    }

    return log;
  }
};