var request = require('request');
var nodejsUrl = require('url');

/**
 *
 * @param req
 * @param res
 * @param params
 * @return {Object}
 */

var authorizationCache = {};
var authenticateAppApiKeyCache = {};

module.exports = function(req, res, params) {
  var apiKey = process.env.FH_APP_API_KEY;
  var authConfig = (params && params.authConfig) || process.env.FH_ENDPOINT_CONFIG;

  // connect seems to lowercase headers??
  var APP_HEADER_KEY = "x-fh-auth-app";
  var USER_HEADER_KEY = "x-fh-auth-user";
  var APP_KEY_PARAM_KEY = "appkey";
  var USER_KEY_PARAM_KEY = "userkey";
  var SERVICE_ACCESS_KEY = 'x-fh-service-access-key';

  var SERVICE_ID_KEY = 'x-request-with';

  var OVERRIDES_KEY = "overrides";
  var DEFAULT_KEY = "default";
  var UNAUTHORISED_HTTP_CODE = 401;

  var DEFAULT_CACHE_REFRESH_SECONDS = 3600;
  var CACHE_REFRESH_KEY = "AUTH_CACHE_REFRESH_SECONDS";

  /**
   * private
   */
  function authenticateAppApiKey(cb) {
    var sentApiKey = getAppApiKey();

    // Fail fast if no keys
    if (!sentApiKey || !apiKey) {
      return cb({
        code: UNAUTHORISED_HTTP_CODE,
        message: "Missing App API key(s)"
      });
    }

    var millicore = process.env.FH_MILLICORE;
    var millicoreProt = process.env.FH_MILLICORE_PROTOCOL || "https";
    var env = process.env.FH_ENV;
    var project_id = process.env.FH_WIDGET;
    var app_id = process.env.FH_INSTANCE;

    var now = new Date().getTime();

    //check cache
    if (authenticateAppApiKeyCache.hasOwnProperty(sentApiKey)) {
      var cache = authenticateAppApiKeyCache[sentApiKey];
      //cache not timed out return cb else auth again
      if (cache.timeout > now) {
        // Cache hit
        return cb();
      } else {
        // Cache miss - remove and continue
        delete authenticateAppApiKeyCache[sentApiKey];
      }
    }

    var data = {
      environment: env,
      appApiKey: apiKey,
      clientApiKey: sentApiKey
    };

    // Call Core and validate passed key
    var url = millicoreProt + "://" + millicore + "/box/api/projects/" + project_id + "/apps/" + app_id + "/validate_key";
    request.post({
      url: url,
      json: true,
      body: data
    }, function(err, res) {
      // Can set API_KEY_VALIDATION_TIMEOUT to expire more frequently than a day
      var expiration = parseInt(process.env.API_KEY_VALIDATION_TIMEOUT, 10) || 86400000; // A day
      var cacheLength = now + expiration; // A day

      // Explicitly handle 404s from Millicore here - the validate_key endpoint may not exist in this cluster
      // If we get a 404, continue
      if (res.statusCode === 404) {
        authenticateAppApiKeyCache[sentApiKey] = {
          "timeout": cacheLength
        };
        return cb();
      }

      if (err) {
        return cb({
          code: 501,
          message: "Error talking to Core to validate API Key - please try again"
        });
      }

      if (res.statusCode === 200) {
        authenticateAppApiKeyCache[sentApiKey] = {
          "timeout": cacheLength
        };
        return cb();
      } else {
        return cb({
          code: UNAUTHORISED_HTTP_CODE,
          message: "Invalid API Key"
        });
      }
    });
  }

  function isServiceApp() {
    return process.env.FH_SERVICE_APP === 'true';
  }

  function resolveServiceVars() {
    var vars = {
      service_app: null,
      service_app_public: null,
      service_authorised_projects: [],
      project_id: null,
      accessor: null,
      service_access_key: null,
      request_access_key: null
    };

    if (process.env['FH_SERVICE_APP']) {
      vars.service_app = isServiceApp();
    }

    if (process.env['FH_SERVICE_APP_PUBLIC']) {
      vars.service_app_public = (process.env['FH_SERVICE_APP_PUBLIC'] === 'true');
    }

    if (process.env['FH_SERVICE_AUTHORISED_PROJECTS']) {
      vars.service_authorised_projects = process.env['FH_SERVICE_AUTHORISED_PROJECTS'].split(',');
    }

    if (process.env['FH_WIDGET']) {
      vars.project_id = process.env['FH_WIDGET'];

      // Add ourself as an authorisedProject, since we should be able to call ourself
      // Dynamic docs in the Studio will also use this ID.
      vars.service_authorised_projects.push(vars.project_id);
    }

    if (req.headers.hasOwnProperty(SERVICE_ID_KEY)) {
      vars.accessor = req.headers[SERVICE_ID_KEY];
    }

    if(req.headers.hasOwnProperty(SERVICE_ACCESS_KEY)){
      vars.request_access_key = req.headers[SERVICE_ACCESS_KEY];
    }

    //If the service has an access key, this can be used to validate requests.
    if (process.env['FH_SERVICE_ACCESS_KEY']){
      vars.service_access_key = process.env.FH_SERVICE_ACCESS_KEY;
    }

    return vars;
  }

  function verifyServiceAuthorisation() {
    // Not a service
    if (!isServiceApp()) return true;

    var envs = resolveServiceVars();

    // Global/public services do not require auth
    if (envs.service_app_public) return true;

    //Preferably, the service access key headers will be used to
    //validate a service request
    if(envs.request_access_key && envs.service_access_key){
      return envs.request_access_key === envs.service_access_key;
    }

    //If no service access key, validate that accessor project can access the service
    if (typeof envs.service_app !== 'undefined' && typeof envs.service_app_public !== 'undefined' && typeof envs.service_authorised_projects !== 'undefined' && typeof envs.accessor !== 'undefined') {
      // Perms check
      if (envs.service_authorised_projects.indexOf(envs.accessor) !== -1) {
        return true;
      }
    }

    // No access
    return false;
  }

  function getAppApiKey() {
    var headers = req.headers;
    if (headers.hasOwnProperty(APP_HEADER_KEY)) return headers[APP_HEADER_KEY];
    // Form data sends these through as strings, not JSON objects & we can't set headers
    if (params && params['__fh.' + APP_KEY_PARAM_KEY]) {
      return params['__fh.' + APP_KEY_PARAM_KEY];
    }
    if (params && params.__fh) { // move this check to last since __fh will now be added to all requests
      return params.__fh[APP_KEY_PARAM_KEY];
    }
    return undefined;
  }

  function getUserApiKey() {
    var headers = req.headers;
    if (headers.hasOwnProperty(USER_HEADER_KEY)) {
      return headers[USER_HEADER_KEY];
    }
    // Form data sends these through as strings, not JSON objects & we can't set headers
    if (params && params['__fh.' + USER_KEY_PARAM_KEY]) {
      return params['__fh.' + USER_KEY_PARAM_KEY];
    }
    if (params && params.__fh) { // move this check to last since __fh will now be added to all requests
      return params.__fh[USER_KEY_PARAM_KEY];
    }
    return undefined;
  }

  function processAuth(authType, cb) {
    switch (authType) {
      case "https":
        cb();
        break;
      case "appapikey":
        authenticateAppApiKey(cb);
        break;
      default:
        cb({
          code: UNAUTHORISED_HTTP_CODE,
          message: "unknown auth type " + authType
        });
        break;
    }
  }

  /**
   * The refresh interval of the authentication cache should be configurable. Since
   * this is running inside a cloud app the best option is th use an environment
   * variable.
   * @returns {*}
   */
  function getCacheRefreshInterval() {
    var value = parseInt(process.env[CACHE_REFRESH_KEY]);

    // Should we 0 here to invalidate the cache immediately?
    if (value && !isNaN(value) && value > 0) {
      return value;
    }

    return DEFAULT_CACHE_REFRESH_SECONDS;
  }

  /**
   * If `params` has the `requestedPermission` property we append it to the URL. Millicore
   * can then differ between read and write permissions for the given action.
   *
   * @param url Millicore request URL
   * @returns {string} URL string
   */
  function appendRequestedPermission(url) {
    if(params.requestedPermission) {
      return url + "&requestedAct=" + params.requestedPermission;
    }

    return url;
  }

  return {
    /**
     *
     * @param endpoint
     * @param cb
     * @return {*}
     *
     * checks the authConfig set when the was last started for the endpoint being called and
     * checks if the requester is allowed to access this endpoint.
     */
    "authenticate": function(endpoint, cb) {
      //extract only the pathname
      endpoint = nodejsUrl.parse(endpoint).pathname;

      if (!verifyServiceAuthorisation()) {
        return cb({
          code: 401,
          message: "You do not have permission to access this service."
        });
      }

      //if there is no auth config then assume nothing has been setup for this app yet and continue as normal.
      if (!authConfig) {
        return cb();
      }
      if ('string' === typeof authConfig) {
        try {
          authConfig = JSON.parse(authConfig);
        } catch (e) {
          return cb({
            code: 503,
            message: "failed to parse auth config " + e.message
          });
        }
      }
      var overrides = authConfig[OVERRIDES_KEY];
      var defaultOpt = authConfig[DEFAULT_KEY];
      //if there is a config set for this option process it.
      if (typeof overrides === 'object' && (overrides.hasOwnProperty(endpoint) || overrides.hasOwnProperty('*'))) {
        var enpointConfig = overrides[endpoint] || overrides['*'];
        //there is a config for this endpoint it must have a security property otherwise we cannot decide how to proceed.

        if ('object' === typeof enpointConfig && enpointConfig.hasOwnProperty("security")) {
          var authType = enpointConfig.security.trim();
          processAuth(authType, cb);
        } else {
          return cb({
            code: 503,
            message: " internal error"
          });
        }
      } else {
        //fall back to config default
        processAuth(defaultOpt, cb);
      }
    },
    /**
     *
     * @param requestedPerm
     * @param cb
     * @returns {*}
     */
    "authorise": function(requestedPerm, cb) {
      //switch off for local db or if explicitly told to
      if (process.env.FH_USE_LOCAL_DB || process.env.FH_SKIP_MBAAS_AUTH) {
        return cb();
      }
      var userApiKey = getUserApiKey();
      var appApiKey = getAppApiKey();
      var millicore = process.env.FH_MILLICORE;
      var millicoreProt = process.env.FH_MILLICORE_PROTOCOL || "https";
      var env = process.env.FH_ENV;

      if (!appApiKey || !userApiKey) {
        return cb({
          code: 401,
          message: "unauthorised"
        });
      }
      if (!env || !millicore) {
        return cb({
          code: 503,
          "message": "missing environment variables"
        });
      }
      var now = new Date().getTime();

      var cacheKey = [userApiKey];
      if (requestedPerm) {
        cacheKey.push('-' + requestedPerm);
      }
      if (params.requestedPermission) {
        cacheKey.push('-' + params.requestedPermission);
      }
      cacheKey = cacheKey.join('');

      //check cache
      if (authorizationCache.hasOwnProperty(cacheKey)) {
        var cache = authorizationCache[cacheKey];
        //cache not timed out return cb else auth again
        if (cache.timeout > now) {
          if (cache.auth) return cb();
          else {
            cb({
              code: 401,
              "message": "unauthorised"
            });
          }
        }
      }

      var authEndpoint = millicoreProt + "://" + millicore + "/box/api/mbaas/admin/authenticateRequest?appApiKey=" + appApiKey + "&env=" + env + "&requestedPerm=" + requestedPerm;

      // Append `requestedAct` query parameter if possible
      authEndpoint = appendRequestedPermission(authEndpoint);

      var headers = {};
      headers[USER_HEADER_KEY.toUpperCase()] = userApiKey;
      request.get({
        "url": authEndpoint,
        headers: headers
      }, function(err, res, data) {
        var cacheLength = now + (1000 * getCacheRefreshInterval());
        if (err) {
          return cb(err);
        }

        if (res.statusCode === 200) {
          authorizationCache[cacheKey] = {
            "timeout": cacheLength,
            "auth": true
          };
          return cb();
        } else {
          authorizationCache[cacheKey] = {
            "timeout": cacheLength,
            "auth": false
          };
          cb({
            code: 401,
            "message": (data && data.message) || "unauthorised"
          });
        }
      });
    }
  };
};
