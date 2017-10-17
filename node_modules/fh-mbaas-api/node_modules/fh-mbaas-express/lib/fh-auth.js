var express = require('express');
var bodyParser = require('body-parser');
var cors = require('./common/cors');
var fhMbaasApi = require('./common/fhMbaasApi');
var app = express.Router();
var fh = fhMbaasApi.getFhApi();

function sendResponse(status, body, res,  next) {
  var response = body;

  // The body is likely to be a string. We need to parse it in order
  // to use it with the jQuery#json function
  if (typeof body === 'string') {
    try {
      response = JSON.parse(body);
    } catch(err) {
      return next(err);
    }
  }

  return res.status(status).json(response);
}

//performs authentication request ($fh.auth)
function performAuth(opts) {
  var localAuth = opts.localAuth;
  return function (req, res, next) {
    if (fh && fh.auth && fh.auth.performAuth) {
      req.pause();
      fh.auth.performAuth(req, localAuth, function (err, fhres) {
        req.resume();

        if (err || !fhres) {
          next(err || new Error("No response sent by authentication endpoint"));
        } else {
          sendResponse(fhres.status, fhres.body, res, next);
        }
      });
    } else {
      return res.status(404).end();
    }
  };
};

app.use(cors());
app.use(bodyParser.json({ "limit": "10mb" }));
module.exports = function (opts) {
  app.post('/srv/1.1/admin/authpolicy/auth', performAuth(opts || {}));
  return app;
};