var request = require('request');
var config = require('../config/config.js');
var url = require('url');
var constants = require('../config/constants.js');
var _ = require('underscore');
var log = require('../logger/logger.js').getLogger();
var addPaginationUrlParams = require('../config/addPaginationUrlParams');
var CONSTANTS = require('../config/constants');

/**
 * Validating Params Have Expected Key Values
 * @param expectedKeys
 * @param params
 * @private
 */
function validateParamsPresent(expectedKeys, params) {
  params = params || {};
  var paramKeys = _.keys(params);
  return _.first(_.difference(expectedKeys, _.intersection(paramKeys, expectedKeys)));
}


/**
 * Validating Common Params Between Admin and App MbaaS Requests
 * @param params
 * @private
 */
function validateCommonParams(params) {
  log.logger.debug({params: params}, "FH-MBAAS-CLIENT: validateCommonParams");
  var expectedParams = ["method", "data", "resourcePath", "environment", "domain"];

  var missingParam = validateParamsPresent(expectedParams, params);

  if (missingParam) {
    return missingParam;
  }

  //The resource Path Is Invalid If It Is An Object
  log.logger.debug('ResourcePath :: ', params.resourcePath);
  if (_.isObject(params.resourcePath)) {
    log.logger.debug('Resource Path Is Object, returning path key !!! ', params.resourcePath);
    return params.resourcePath.key;

  }

  //If it is a file request, the data entry must contain file params.
  if (params.fileRequest && params.fileUploadRequest) {
    missingParam = validateParamsPresent(["name", "type", "size", "stream"], params.data);
  }

  return missingParam;
}

/**
 * App API Requests To An MbaaS Require
 * @param params
 * @returns {*}
 * @private
 */
function validateAppParams(params) {
  params = params || {};

  var expectedAppParams = ["project", "app", "accessKey", "appApiKey", "url"];

  var missingParam = validateCommonParams(params);

  if (missingParam) {
    return new Error("Missing Param " + missingParam);
  }

  missingParam = validateParamsPresent(expectedAppParams, params);

  if (missingParam) {
    return new Error("Missing MbaaS Config Param " + missingParam);
  }

  return undefined;
}

/**
 * Administration API Requests To An MbaaS Require The Username And Password Of The MbaaS.
 * @param params
 * @returns {*}
 * @private
 */
function validateAdminParams(params) {
  log.logger.debug({params: params}, "FH-MBAAS-CLIENT: validateAdminParams");
  var missingParam = validateCommonParams(params);

  var expectedAdminMbaasConfig = ["url", "username", "password"];

  if (missingParam) {
    return new Error("Missing Param " + missingParam);
  }

  missingParam = validateParamsPresent(expectedAdminMbaasConfig, params);
  if (missingParam) {
    return new Error("Missing MbaaS Config Param " + missingParam);
  }

  return undefined;
}

/**
 * Building Request Params For A Call To Administration APIs In An MbaaS
 * @param params
 * @returns {{url: *, json: boolean, method: (method|*|string), auth: {user: *, pass: *}, headers: {host: string}, body: *}}
 * @private
 */
function _buildAdminMbaasParams(params) {
  log.logger.debug({params: params}, "FH-MBAAS-CLIENT: _buildAdminMbaasParams");
  var basePath;
  basePath = config.addURIParams(constants.ADMIN_API_PATH, params);

  params = params || {};

  var method, resourcePath;

  method = params.method;
  resourcePath = params.resourcePath;

  var mbaasUrl =  params.__mbaasUrl;
  var parsedMbaasUrl = url.parse(mbaasUrl);
  parsedMbaasUrl.pathname = basePath + resourcePath;

  var adminRequestParams = {
    url: parsedMbaasUrl.format(),
    method: method,
    headers: {
      host: parsedMbaasUrl.host,
      'x-fh-service-key': params.servicekey
    },
    fileRequest: params.fileRequest,
    fileUploadRequest: params.fileUploadRequest,
    data: params.data,
    paginate: params.paginate,
    envLabel: params._label
  };

  if (params.username && params.password) {
    adminRequestParams.auth = {
      user: params.username,
      pass: params.password
    };
  }

  log.logger.debug({adminRequestParams: adminRequestParams}, "FH-MBAAS-CLIENT: _buildAdminMbaasParams");
  return adminRequestParams;
}


/**
 * Create a response handler from a request to the MBaaS.
 * @param params
 * @param cb
 * @returns {handleResponse}
 */
function responseHandler(params, cb) {

  return function handleResponse(err, httpResponse, body) {
    body = body || "{}";
    httpResponse = httpResponse || {};

    //The response should be JSON. If it is a string, then the response should be parsed.
    if (_.isString(body)) {
      try {
        body = JSON.parse(body);
      } catch (e) {
        log.logger.error("FH-MBAAS-CLIENT: Invalid Response Body ", {body: body});
      }
    }

    log.logger.debug("FH-MBAAS-CLIENT:  Request Finish ", {
      err: err,
      httpResponse: httpResponse.statusCode,
      body: body
    });

    // provide defaults
    if (httpResponse && httpResponse.statusCode >= 400) {
      err = err || {};
      err.httpCode = httpResponse.statusCode;
      err.message = "Unexpected Status Code " + httpResponse.statusCode;
    }

    //There is a specific error message if an environment is unreachable
    if (httpResponse && httpResponse.statusCode === 503) {
      err = {
        httpCode: 503,
        message: CONSTANTS.ERROR_MESSAGES.ENVIRONMENT_UNREACHABLE.replace('{{ENVLABEL}}', params.envLabel || "")
      };
    }

    // MbaaS unavailable
    if (err && err.code !== undefined && (err.code === "ENOTFOUND" || err.code === "ETIMEDOUT")) {
      err = {
        httpCode: httpResponse.statusCode || 500,
        message: "MBaaS environment is not reachable. Please make the environment available or delete it. Environment Label - " + params.envLabel || ""
      };
    }

    if (err) {
      cb(err || body || "Unexpected Status Code " + httpResponse.statusCode);
    } else {
      cb(undefined, body);
    }
  };
}




/**
 * Perform A Request To An MbaaS
 * @private
 */
function doFHMbaaSRequest(params, cb) {
  //Preventing multiple callbacks.
  // _.defaults(undefined, ...) === undefined, so we still need to OR with an empty object
  params = _.defaults(params || {}, {
    headers: {}
  });

  //Adding pagination parameters if required
  params.url = addPaginationUrlParams(params.url, params);

  // add request id header to request if present
  if (_.isFunction(log.logger.getRequestId)) {
    var reqId = log.logger.getRequestId();
    if (reqId) {
      params.headers[log.logger.requestIdHeader] = reqId;
    }
  }

  log.logger.debug({params: params}, "FH-MBAAS-CLIENT: doFHMbaaSRequest");

  var fileData = params.data;

  //If it is a file upload request, the file data is assigned differently
  if (params.fileRequest && params.fileUploadRequest) {
    params.json = false;
  } else {
    //Normal JSON Request
    params.json = true;
    //Dont set a body if it is a get request
    if (params.method === "GET") {
      params.qs = params.data;
    } else {
      params.body = params.data;
    }
  }

  //The data field is no longer needed
  params = _.omit(params, 'data');

  //If Mbaas Request Expects To Send/Recieve Files, then return the request value
  if (params.fileRequest && params.fileUploadRequest) {
    log.logger.debug("FH-MBAAS-CLIENT: doFHMbaaSRequest File Upload Request");
    var formData = {};
    formData[fileData.name] = {
      value: fileData.stream,
      options: {
        filename: fileData.name,
        contentType: fileData.type
      }
    };

    return request({
      method: params.method,
      url: params.url,
      auth: params.auth,
      headers: params.headers,
      formData: formData
    }, responseHandler(params, cb));
  } else if (params.fileRequest) {
    log.logger.debug("FH-MBAAS-CLIENT: doFHMbaaSRequest File Download Request");
    //File Download Request. Return the readable request stream.
    return cb(undefined, request(params));
  } else {
    //Normal call.
    log.logger.debug("FH-MBAAS-CLIENT: doFHMbaaSRequest Normal Request");
    request(params, responseHandler(params, cb));
  }
}


/**
 * Building Request Params For An App Request To An Mbaas
 * @param params
 * @returns {{url: string, body: *, method: (method|*|string), json: boolean, headers: {fh-app-env-access-key: *}}}
 * @private
 */
function _buildAppRequestParams(params) {
  params = params || {};

  var basePath = config.addURIParams(constants.APP_API_PATH, params);

  var fullPath = basePath + params.resourcePath;

  var mbaasUrl = url.parse(params.url);

  mbaasUrl.pathname = fullPath;

  var headers = {
    'x-fh-env-access-key': params.accessKey,
    'x-fh-auth-app': params.appApiKey
  };

  return {
    url: mbaasUrl.format(mbaasUrl),
    method: params.method,
    headers: headers,
    fileRequest: params.fileRequest,
    fileUploadRequest: params.fileUploadRequest,
    data: params.data,
    paginate: params.paginate
  };
}


/**
 * Performing A Request Against The Admin MBaaS API
 * @param params
 * @param cb
 */
function adminRequest(params, cb) {
  params = params || {};
  var mbaasConf = params[constants.MBAAS_CONF_KEY];
  params[constants.MBAAS_CONF_KEY] = undefined;
  log.logger.debug({params: params}, "FH-MBAAS-CLIENT: adminRequest ");
  var fullParams = _.extend(_.clone(params), mbaasConf);
  log.logger.info({
    env: params.environment,
    domain: fullParams.domain,
    mbaasUrl: fullParams.__mbaasUrl
  }, "FH-MBAAS-CLIENT.adminRequest - calling mbaas:");
  var invalidParamError = validateAdminParams(fullParams);

  if (invalidParamError) {
    return cb(invalidParamError);
  }

  fullParams = _buildAdminMbaasParams(fullParams);

  log.logger.debug({fullParams: fullParams}, "FH-MBAAS-CLIENT: adminRequest ");

  return doFHMbaaSRequest(fullParams, cb);
}



/**
 * Performing A Request Against The App MBaaS API
 * @param params
 * @param cb
 */
function appRequest(params, cb) {
  params = params || {};
  var mbaasConf = params[constants.MBAAS_CONF_KEY];
  params[constants.MBAAS_CONF_KEY] = undefined;
  //Adding Mbaas Config Params
  var fullParams = _.extend(_.clone(params), mbaasConf);

  var invalidParamError = validateAppParams(fullParams);

  if (invalidParamError) {
    return cb(invalidParamError);
  }

  fullParams = _buildAppRequestParams(fullParams);

  return doFHMbaaSRequest(fullParams, cb);
}


module.exports = {
  admin: adminRequest,
  app: appRequest
};
