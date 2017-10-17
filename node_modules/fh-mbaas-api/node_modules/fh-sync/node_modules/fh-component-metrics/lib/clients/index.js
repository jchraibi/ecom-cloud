function MetricClients(backends) {
  this.clients = [];
  this.init(backends);
}

/**
 * Init clients for each of the backend specified in the given backends
 *
 * @param {Array} backends the backend configurations
 */
MetricClients.prototype.init = function(backends) {
  var self = this;
  if (backends) {
    backends.forEach(function(backendConfig) {
      var client = self.initClient(backendConfig);
      if (client) {
        self.clients.push(client);
      }
    });
  }
};

/**
 * Init a single client for the given backend
 *
 * @param {Object} backend
 */
MetricClients.prototype.initClient = function(backend) {
  var type = backend.type;
  var clientModule;
  try  {
    if (!type) {
      throw new Error('invalid type ' + type);
    }
    clientModule = require('./' + type);
  } catch (e) {
    /*eslint-disable no-console */
    console.warn('can not find valid client for metrics backend ' + JSON.stringify(backend));
  }
  if (clientModule) {
    return clientModule.init(backend);
  } else {
    return null;
  }
};

/**
 * Send messages. This will invoke the `send` method of each client
 *
 * @param {Object} message
 */
MetricClients.prototype.send = function(message) {
  this.clients.forEach(function(client) {
    client.send.call(client, message);
  });
};

module.exports = MetricClients;