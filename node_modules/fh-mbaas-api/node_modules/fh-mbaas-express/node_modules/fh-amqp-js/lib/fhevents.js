// App related events
exports.DYNOMAN_APP_START_FAILED = "fh.events.dynoman.app.start-failed";
exports.DYNOMAN_APP_START_SUCCEEDED = "fh.events.dynoman.app.start-succeeded";
exports.DYNOMAN_APP_STOP_FAILED = "fh.events.dynoman.app.stop-failed";
exports.DYNOMAN_APP_STOP_SUCCEEDED = "fh.events.dynoman.app.stop-succeeded";
exports.DYNOMAN_APP_STAGE_FAILED = "fh.events.dynoman.app.stage-failed";
exports.DYNOMAN_APP_STAGE_SUCCEEDED = "fh.events.dynoman.app.stage-succeeded";
exports.DYNOMAN_APP_DELETE_FAILED = "fh.events.dynoman.app.delete-failed";
exports.DYNOMAN_APP_DELETE_SUCCEEDED = "fh.events.dynoman.app.delete-succeeded";
exports.DYNOMAN_APP_SUSPEND_SUCCEEDED = "fh.events.dynoman.app.suspend-succeeded";
exports.DYNOMAN_APP_IMPORT_SUCCEEDED = "fh.events.dynoman.app.import-succeeded";
exports.DYNOMAN_APP_EXPORT_SUCCEEDED = "fh.events.dynoman.app.export-succeeded";
exports.DYNOMAN_CORE_APP_CRASH = "fh.events.nodeapp.app.crashed";

// Millicore related events
exports.CORE_APP_START_REQUESTED = "fh.events.millicore.app.start-reqeusted";
exports.CORE_APP_STOP_REQUESTED = "fh.events.millicore.app.stop-requested";
exports.CORE_APP_DEPLOY_REQUESTED = "fh.events.millicore.app.deploy-requested";
exports.CORE_APP_ENV_CHANGE_REQUESTED = "fh.events.millicore.env.change-requested";
exports.CORE_APP_CREATE_REQUESTED = "fh.events.millicore.app.create-requested";
exports.CORE_APP_DELETE_REQUESTED = "fh.events.millicore.app.delete-requested";

// Dyno related events
exports.DYNOMAN_DYNO_CREATE_SUCCEEDED = "fh.events.dynoman.dyno.create-succeeded";
exports.DYNOMAN_DYNO_DELETE_SUCCEEDED = "fh.events.dynoman.dyno.delete-succeeded";
exports.DYNOMAN_DYNO_START_SUCCEEDED  = "fh.events.dynoman.dyno.start-succeeded";
exports.DYNOMAN_DYNO_STOP_SUCCEEDED  = "fh.events.dynoman.dyno.stop-succeeded";
exports.DYNOMAN_RESOURCES_CHANGED_SUCCEEDED = "fh.events.dynoman.dyno.resources-changed-succeeded";
exports.DYNOMAN_DYNO_IMPORT_SUCCEEDED  = "fh.events.dynoman.dyno.import-succeeded";
exports.DYNOMAN_DYNO_EXPORT_SUCCEEDED  = "fh.events.dynoman.dyno.export-succeeded";

// Monit related events
exports.MONIT_APP_TERMINATED = "fh.events.monit.app.terminated";
exports.MONIT_APP_HIGH_CPU = "fh.events.monit.app.high-cpu";
exports.MONIT_APP_HIGH_MEMORY = "fh.events.monit.app.high-memory";

//supercore related events
exports.SUPERCORE_APP_DEPLOYED = "fh.events.supercore.app.deploy-succeeded";
exports.SUPERCORE_APP_DEPLOY_FAILED = "fh.events.supercore.app.deploy-failed";

//openshift related events
exports.OPENSHIFT_APP_DEPLOY_REQUESTED = "fh.events.openshift.app.deploy-requested";
exports.OPENSHIFT_APP_DEPLOYED = "fh.events.openshift.app.deploy-succeeded";
exports.OPENSHIFT_APP_DEPLOY_FAILED = "fh.events.openshift.app.deploy-failed";

var core = {};
core[exports.CORE_APP_START_REQUESTED] = {
  "eventClass": "APP_STATE",
  "eventType": "START_REQUESTED",
  "eventLevel": "INFO"
};

core[exports.CORE_APP_STOP_REQUESTED] = {
  "eventClass": "APP_STATE",
  "eventType": "STOP_REQUESTED",
  "eventLevel": "INFO"
};

core[exports.CORE_APP_DEPLOY_REQUESTED] = {
  "eventClass": "APP_STATE",
  "eventType": "DEPLOY_REQUESTED",
  "eventLevel": "INFO"
};

core[exports.CORE_APP_ENV_CHANGE_REQUESTED] = {
  "eventClass": "APP_ENVIRONMENT",
  "eventType": "CHANGE_REQUESTED",
  "eventLevel": "INFO"
};

core[exports.CORE_APP_CREATE_REQUESTED] = {
  "eventClass": "APP_STATE",
  "eventType": "CREATE_REQUESTED",
  "eventLevel": "INFO"
};

core[exports.CORE_APP_DELETE_REQUESTED] = {
  "eventClass": "APP_STATE",
  "eventType": "DELETE_REQUESTED",
  "eventLevel": "INFO"
};

var dynoman = {};
dynoman[exports.DYNOMAN_APP_START_FAILED] = {
  "eventClass":"APP_STATE",
  "eventType":"START_FAILED",
  "eventLevel":"ERROR"
};

dynoman[exports.DYNOMAN_APP_START_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"START_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_APP_STOP_FAILED] = {
  "eventClass":"APP_STATE",
  "eventType":"START_FAILED",
  "eventLevel":"ERROR"
};

dynoman[exports.DYNOMAN_APP_STOP_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"STOP_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_APP_SUSPEND_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"SUSPEND_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_APP_STAGE_FAILED] = {
  "eventClass":"APP_STATE",
  "eventType":"DEPLOY_FAILED",
  "eventLevel":"ERROR"
};

dynoman[exports.DYNOMAN_APP_STAGE_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"DEPLOYED",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_APP_DELETE_FAILED] = {
  "eventClass":"APP_STATE",
  "eventType":"DELETED",
  "eventLevel":"ERROR"
};

dynoman[exports.DYNOMAN_APP_DELETE_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"DELETED",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_APP_IMPORT_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"IMPORTED",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_APP_EXPORTED_SUCCEEDED] = {
  "eventClass":"APP_STATE",
  "eventType":"EXPORTED",
  "eventLevel":"INFO"
};

// Dyno Related event details
dynoman[exports.DYNOMAN_DYNO_CREATE_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"CREATED",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_DYNO_DELETE_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"DELETED",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_DYNO_START_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"START_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_DYNO_STOP_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"STOP_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_RESOURCES_CHANGED_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"RESOURCES_CHANGED_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_DYNO_IMPORT_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"IMPORT_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_DYNO_EXPORT_SUCCEEDED] = {
  "eventClass":"DYNO_STATE",
  "eventType":"EXPORT_SUCCESSFUL",
  "eventLevel":"INFO"
};

dynoman[exports.DYNOMAN_CORE_APP_CRASH] = {
  "eventClass" : "APP_STATE",
  "eventType" : "CRASHED",
  "eventLevel" : "FATAL"
};

// Monit related event details
var monit = {};

monit[exports.MONIT_APP_TERMINATED] = {
  "eventClass":"APP_STATE",
  "eventType":"TERMINATED",
  "eventLevel":"FATAL",
  "eventMessage":"App failed to restart - %s"
};

monit[exports.MONIT_APP_HIGH_CPU] = {
  "eventClass": "APP_STATE",
  "eventType":"HIGH_CPU",
  "eventLevel": "WARN",
  "eventMessage": "App has high CPU usage - %s"
};

monit[exports.MONIT_APP_HIGH_MEMORY] = {
  "eventClass": "APP_STATE",
  "eventType":"HIGH_MEMORY",
  "eventLevel": "WARN",
  "eventMessage": "App has high memroy usage - %s"
};

var supercore = {};
supercore[exports.SUPERCORE_APP_DEPLOYED] = {
  "eventClass":"APP_STATE",
  //use a different event type so that it will not be saved in the notification db (this is for deploy history)
  "eventType":"APP_DEPLOYED",
  "eventLevel":"INFO"
};
supercore[exports.SUPERCORE_APP_DEPLOY_FAILED] = {
  "eventClass":"APP_STATE",
  //use a different event type so that it will not be saved in the notification db (this is for deploy history)
  "eventType":"APP_DEPLOY_FAILED",
  "eventLevel":"ERROR"
};

var openshift = {};
openshift[exports.OPENSHIFT_APP_DEPLOY_REQUESTED] = {
  "eventClass": "APP_STATE",
  "eventType": "DEPLOY_REQUESTED",
  "eventLevel": "INFO"
};
openshift[exports.OPENSHIFT_APP_DEPLOYED] = {
  "eventClass":"APP_STATE",
  "eventType":"DEPLOYED",
  "eventLevel":"INFO"
};
openshift[exports.OPENSHIFT_APP_DEPLOY_FAILED] = {
  "eventClass":"APP_STATE",
  "eventType":"DEPLOY_FAILED",
  "eventLevel":"ERROR"
};

exports.dynoman = dynoman;
exports.monit = monit;
exports.core = core;
exports.supercore = supercore;
exports.openshift = openshift;
