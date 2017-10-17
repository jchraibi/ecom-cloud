var FeedhenryReporting = require('fh-reportingclient');

// ----------------------------------------------------------------------------------------------------------
// Send a message of a particular format(FHActReport or FHWebReport) to the message server and/or backup log
// ----------------------------------------------------------------------------------------------------------
function sendReport(opts) {

  // Expected: { topic:'' } plus

  if('object' !== typeof opts){
    return;
  }
  if(process.env.FH_MESSAGING_ENABLED !== 'true'){
    return;
  }

  process.nextTick(function () {
    var topic = opts.topic || 'notopic';
    var report;
    switch (topic) {
      case 'fhact':
        report = createFHActReport(opts);
        break;
      case 'fhweb':
        report = createFHWebReport(opts);
        break;
      default:
        report = createFHActReport(opts);
        break;
    }
    try {
      if (report) {
        var reporting = new FeedhenryReporting.Reporting(getMessagingConfig());
        reporting.logMessage(topic, report, function (err, results) { /* ignoring callback */ });
      }
    } catch (e) {
      /* ignoring exception */
    }
  });
}


//
// Ask the reporting client to flush its current batch or report messages in event of app crashing
//
function flushReports(){
    try {
        var reporting = new FeedhenryReporting.Reporting(getMessagingConfig());
        reporting.flushReports();
    } catch (e) {
      /* ignoring exception */
    }
}

//
// Build the messaging configuration for the Reporting Client
//
function getMessagingConfig(){
  return {
    host:         process.env.FH_MESSAGING_HOST || '',
    cluster:      process.env.FH_MESSAGING_CLUSTER || '',
    realTimeLoggingEnabled: isRealtimeLoggingEnabled(),
    mbaasType: mbaasType(),
    decoupled: process.env.FH_MBAAS_DECOUPLED ||  false,
    msgServer:    {
      logMessageURL: getLogMessageURL()
    },
    backupFiles:  {
      fileName: process.env.FH_MESSAGING_BACKUP_FILE || ''
    },
    recoveryFiles:{
      fileName: process.env.FH_MESSAGING_RECOVERY_FILE || ''
    }
  };
}

//
// Get the logging message URL taking into account OpenShift environmental factors
//
function getLogMessageURL(){
  var url = '';
  if (process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP){
    url = 'http://' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP + ':' + process.env.OPENSHIFT_FEEDHENRY_REPORTER_PORT;
    url += '/sys/admin/reports/TOPIC';
  } else {
    url = process.env.FH_MESSAGING_SERVER || ''; // Default setting
  }
  return url;
}

function mbaasType(){
  if (process.env.FH_MBAAS_TYPE){
    return process.env.FH_MBAAS_TYPE;
  }
  else if(process.env.OPENSHIFT_FEEDHENRY_REPORTER_IP){
    return "openshift";
  }
  return "feedhenry";
}

//
// Is realtime logging enabled for this application
//
function isRealtimeLoggingEnabled(){
  var flag = process.env.FH_MESSAGING_REALTIME_ENABLED;
  if (flag && (flag === 'true' || flag === true) ){
    return true;
  }
  return false;
}

function createFHActReport (opts) {
  var report = {};
  if (opts.hasOwnProperty('fullparams')) {
    var fullparams = opts.fullparams;
    var  _fh = fullparams.__fh || {};
    var  ip = fullparams.ipAddress || '';

    //report body
    report = {
      guid:         process.env.FH_INSTANCE,
      appid:        process.env.FH_WIDGET,
      domain:       process.env.FH_DOMAIN,
      environment:  process.env.FH_ENV,
      mbaasid:      process.env.FH_MBAAS_ID || "",
      mbaasType:    process.env.FH_MBAAS_TYPE || "",
      bytes:        fullparams.bytes,
      cached:       false,
      cuid:         _fh.cuid || '',
      destination:  _fh.destination || '',
      agent:        fullparams.agent,
      'function':   fullparams.funct || '',
      ipAddress:    ip,
      scriptEngine: 'node',
      'status':     fullparams.status || '',
      time:         fullparams.time || 0,
      startTime :   fullparams.start,
      endTime :     fullparams.end,
      'version':    _fh.version || 0
    };
  }
  return report;
}

function createFHWebReport (opts) {
  return {
    guid:         process.env.FH_INSTANCE,
    appid:        process.env.FH_WIDGET,
    environment:  process.env.FH_ENV,
    cuid:         '',
    bytes:        opts.bytes || 0,
    conns:        0,
    destination:  opts.destination || '',
    domain:       process.env.FH_DOMAIN,
    ipAddress:    '',
    referrer:     '',
    start:        opts.start || 0,
    status:       opts.status || 0,
    time:         opts.time || 0,
    url:          opts.url || '',
    version:      0
  };
}

exports.createFHWebReport = createFHWebReport;
exports.createFHActReport = createFHActReport;
exports.sendReport        = sendReport;
exports.flushReports      = flushReports;
