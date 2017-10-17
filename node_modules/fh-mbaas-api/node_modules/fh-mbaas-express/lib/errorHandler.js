var util = require('util');
var url = require('url');
var messaging = require('./common/message.js')();
var request = require('request');
var mbaasClient = require('fh-mbaas-client');
var fhreports = require('./cloud/fh-reports.js');

process.on('uncaughtException', function (err) {
  handleUncaughtException(err);
});

function addTimestamp(logMsg){
  // Returns log message with prepended timestamp
  return "[" + new Date().toISOString() + "] " + logMsg;
}

function handleUncaughtException(err){
  // Make sure to send reports in advance of allowing app to die
  fhreports.flushReports();
  err = err || {};
  console.error(addTimestamp('uncaughtException: ' + util.inspect(err)));
  var errorMessage = errHandler(err, null, null);
  errorMessage.type = 'DYNOMAN_CORE_APP_CRASH';
  getErrorReporter()(errorMessage, function(){
    shutdown(1);
  });
}

function errHandler(err, req, res, next){
  console.log(addTimestamp("Internal error: " + util.inspect(err)));
  console.error(addTimestamp("Internal error: " + util.inspect(err)));
  if (err && err.stack) console.error(err.stack);

  var errorMessage = {
    msg: 'Internal error: ' + util.inspect(err),
    error: util.inspect(err)
  };
  if (res) {
    res.statusCode = 500;
    res.end(JSON.stringify(errorMessage));
  }

  return errorMessage;
}

function errorHandler() {
  return errHandler;
}

function getErrorReporter(){
  // AMQP
  if(process.env.FH_AMQP_APP_ENABLED && process.env.FH_AMQP_APP_ENABLED === 'true'){
    return function (message, cb){
      putErrorOnBus(message, cb);
    };
  }
  // OPENSHIFT
  else if(process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP){
    return function (message, cb){
      request({
        method : 'POST',
        url : 'http://' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP + ':' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_PORT + '/sys/admin/notifications',
        json : message
      }, function(error, response, body){
        console.error(addTimestamp("Failed to publish error report: " + util.inspect(error)));
        console.error(addTimestamp("Response body : " + body));
        return cb();
      });
    }
  }
  // MBAAS
  else{
    return function (message, cb){
      createMBaasEvent({
        protocol: process.env.FH_MBAAS_PROTOCOL || 'https',
        envAccessKey: process.env.FH_MBAAS_ENV_ACCESS_KEY,
        apiKey: process.env.FH_APP_API_KEY,
        project: process.env.FH_WIDGET,
        host: process.env.FH_MBAAS_HOST,
        domain: process.env.FH_DOMAIN,
        guid: process.env.FH_INSTANCE,
        appName: process.env.FH_APPNAME,
        env: process.env.FH_ENV,
        message: message
      }, function(err){
        if (err){
          console.error(addTimestamp('Error creating event in the MBaaS: ' + util.inspect(err)));
          return cb(err);
        } else {
          console.error(addTimestamp('Create event sent to MBaaS: OK'));
          return cb();
        }
      });
    }
  }
}

function putErrorOnBus(mess, cb){
  messaging.getAmqp(function(err, amqpInst){
    //ignoring err as only interested in if we have a connection
    if(amqpInst){
      amqpInst.sendErrorMessage(mess, cb);
    } else {
      process.nextTick(function() {
        return cb();
      });
    }
  });
}

function createMBaasEvent(params, cb){

  // Init the env prior to mbaas call
  mbaasClient.initEnvironment(params.env, {
    url: url.format(params.protocol + '://' + params.host),
    accessKey: params.envAccessKey,
    project: params.project,
    app: params.guid,
    appApiKey: params.apiKey
  });

  // Call create event on the mbaas through the mbaas-client
  mbaasClient.app.events.create({
    'host': params.host,
    'environment': params.env,
    'domain': params.domain,
    'guid': params.guid,
    'data': params.message,
    'appname': params.appName
  }, function (err) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
  });
}

function shutdown(code) {
  process.nextTick(function() {
    var c = code? code: 1;

    // TODO - look into graceful app shutdown here..
    process.exit(c);
  });
}

exports.errorHandler = errorHandler;
exports.handleUncaughtException = handleUncaughtException;
