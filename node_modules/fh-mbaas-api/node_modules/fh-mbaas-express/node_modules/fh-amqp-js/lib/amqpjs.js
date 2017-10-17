var amqp = require('amqp');
var util = require("util");
var async = require("async");
var events = require('events');
var _ = require('lodash');
var parseClusterNodes = require("./parseClusterNodes");
var uuid = require('node-uuid');

function debug() {
  if (process.env && process.env.NODE_DEBUG) {
    console.log.apply(null, arguments);
  }
}

/**
 * FH AMQP manager to handle RabbitMQ connections.
 * @param {Object} cfg Specify the AMQP connection details and other connection options.
 *        {Object} cfg.clusterNodes Required. The clusterNodes can be either an array of amqp URIs, or the connection configuration object specified in https://github.com/postwait/node-amqp#connection-options-and-url
 *                                  If the clusterNodes are an array of amqp URIs, they will be converted to node-amqp connection configuration.
 *                 cfg.options Other connection options can be passed down to node-amqp. E.g. Auto reconnect options.
 */
function AMQPManager(cfg) {
  var _connection;
  var self = this;
  var defaultOptions = {
    reconnect: true,
    reconnectBackoffStrategy: 'linear',
    reconnectBackoffTime: 5000,
    cachePublish: false,
    maxCachePublishSize: 1000
  };
  var defaultConnectOptions = {
    hostPreference: 0,
    connectionTimeout: 5000
  };
  var _pendingSubscribers = [];
  var _cachedPublishMessages = [];
  var _options;
  var _connectionCfg;
  var _rpcCallbacks = {};
  var _rpcReplyQName = null;
  var _rpcReplyQ = null;
  var _rpcSubscribed = false;

  // validate config
  if (!cfg.clusterNodes) {
    throw new Error("'clusterNodes' config param missing");
  }

  // 'clusterNodes' should be an array, but can be a string if passed from commandline
  if (typeof cfg.clusterNodes === 'string') {
    try {
      cfg.clusterNodes = JSON.parse(cfg.clusterNodes);
    } catch (e) {
      //could be just a single url
    }
  }

  /** Public methods */

  /**
   * Connect to our Message Bus Cluster.
   */
  this.connectToCluster = function() {
    var clusterNodes = cfg.clusterNodes;
    if (_.isString(clusterNodes)) {
      clusterNodes = [clusterNodes];
    }
    if (_.isArray(clusterNodes)) {
      _connectionCfg = parseClusterNodes(clusterNodes);
    } else {
      _connectionCfg = clusterNodes;
    }
    var heartbeat = cfg.heartbeat || (cfg.options && cfg.options.heartbeat);
    if (heartbeat) {
      _connectionCfg.heartbeat = heartbeat;
    }
    _connectionCfg = _.extend({}, defaultConnectOptions, _connectionCfg);
    _options = _.extend({}, defaultOptions, cfg.options || {});

    setupConn(_connectionCfg, _options);
  };

  /**
   * Return the actual node-amqp connection object
   * @param  {Function} cb The callback function
   */
  this.getConnection = function(cb) {
    if (_connection && !_connection._isClosed) {
      return cb(null, _connection);
    } else {
      var timer;
      var callback = function() {
        clearTimeout(timer);
        return cb(null, _connection);
      };
      timer = setTimeout(function() {
        if (!_connection || _connection._isClosed) {
          debug('no connection established in ' + _connectionCfg.connectionTimeout + 'ms');
          self.removeListener('ready', callback);
          return cb('failed to connect to message bus');
        }
      }, _connectionCfg.connectionTimeout);
      self.once('ready', callback);
    }
  };

  /**
   * Quickly check if there is an active RabbitMQ connection.
   * @param  {Function} cb The callback function. Error will be returned if there is no active connection.
   */
  this.ping = function(cb) {
    self.getConnection(cb);
  };

  /**
   * Return an exchange with give name and options
   * @param  {String}   name  The exchange name
   * @param  {Object}   opts  Exchange options. e.g. type, durable, confirm, autodelete.
   *                          If not specified, the default will be: {type:'topic', durable: true, confirm: true, autoDelete: false}
   * @param  {Function} cb    The callback function
   */
  this.getExchange = function(name, opts, cb) {
    var callback = cb;
    if (!callback && _.isFunction(opts)) {
      callback = opts;
      opts = null;
    }
    if (!callback) {
      throw new Error('No callback function specified');
    }
    var options = opts || {
      type:'topic',
      durable: true,
      confirm: true,
      autoDelete: false
    };
    if (!options.type) {
      return callback(new Error('no exchange type specified in the opts'));
    }
    self.getConnection(function(err, connection) {
      if (err) {
        return callback(err);
      }
      connection.exchange(name, options, function(ex) {
        return callback(undefined, ex);
      });
    });
  };

  /**
   * Publish to the named topic exchange
   * @param  {String}   exchangeName The exchange name
   * @param  {String}   topic        The topic name
   * @param  {String}   message      The message
   * @param  {Object}   opts         The option for the message
   * @param  {Function} cb           The callback
   */
  this.publishTopic = function(exchangeName, topic, message, opts, cb) {
    var callback = cb;
    if (!callback && _.isFunction(opts)) {
      callback = opts;
      opts = null;
    }
    if (!callback) {
      callback = function() {};
    }
    var options = opts || {
      contentType: 'application/json',
      deliveryMode: 2
    };
    self.getExchange(exchangeName, function(err, exchange) {
      if (err) {
        if (_options.cachePublish) {
          var publishMsg = {
            exchange: exchangeName,
            topic: topic,
            message: message,
            options: options
          };
          _cachedPublishMessages.push(publishMsg);
          if (_cachedPublishMessages.length > _options.maxCachePublishSize) {
            _cachedPublishMessages.shift();
          }
          return callback();
        } else {
          return callback(err);
        }
      }
      exchange.publish(topic, message, options, function(ack) {
        // Note: oddly, ack will be false if the message succeeds
        // important to close the channel (Exchange extends channel calling close here closes the channel not the exchange)
        exchange.close();
        if (ack !== false) {
          return callback("Error publishing message, ack: " + ack);
        }
        return callback();
      });
    });
  };

  /**
   * Publish a message to the bus and wait for the response, like a RPC call.
   * The callback will only be invoked when the consumer returns the result.
   * If you are using this function, make sure the consumer publish the results to the queue
   * that is specified in the "replyTo" header, along with the "correlationId" field.
   * @param  {String}   exchangeName The exchange name
   * @param  {String}   topic        The topic name
   * @param  {String}   message      The message
   * @param  {Object}   opts         The option for the message
   * @param  {Function} cb           The callback
   */
  this.rpcRequest = function(exchangeName, topic, message, opts, cb) {
    var callback = cb;
    if (!callback && _.isFunction(opts)) {
      callback = opts;
      opts = null;
    }
    if (!_.isFunction(callback)) {
      callback = function() {};
    }
    listenForReply(function(err) {
      if (err) {
        return cb(err);
      }

      var correlationId = uuid.v4();
      _rpcCallbacks[correlationId] = callback;
      var timeout = (opts && opts.timeout) || 60000;
      var options = {};
      _.extend(options, {
        contentType: 'application/json',
        deliveryMode: 2,
        expiration: timeout + ''  //1h and it has to be string
      }, opts || {});
      options.correlationId = correlationId;
      options.replyTo = _rpcReplyQName;

      self.publishTopic(exchangeName, topic, message, options, function(err) {
        if (err) {
          return debug('failed to invoke rpc', err);
        }
        debug('rpc message published');
      });
      setTimeout(function() {
        if (_rpcCallbacks[correlationId]) {
          var cb = _rpcCallbacks[correlationId];
          delete _rpcCallbacks[correlationId];
          cb('timeout');
        }
      }, timeout);
    });
  };

  /**
   * Subscribe to messages on a topic
   * @param  {String}   exchangeName  The name of the exchange
   * @param  {String}   qName         The queue name
   * @param  {String}   filter        The filter pattern
   * @param  {Function}   subscribeFunc The function that gets called each time a message happens
   * @param  {Object}   opts          Queue options
   * @param  {Function} callback      Callback function
   */
  this.subscribeToTopic = function(exchangeName, qName, filter, subscribeFunc, opts, callback) {
    if (!callback) {
      if (_.isFunction(opts)) {
        callback = opts;
        opts = undefined;
      } else {
        callback = function() {};
      }
    }

    opts = opts || {
      autoDelete: false,
      durable: true
    };

    self.getConnection(function(err, connection) {
      if (err) {
        //no connection is available, cache the subscribeFunc
        _pendingSubscribers.push({
          exchange: exchangeName,
          queue: qName,
          filter: filter,
          subscriber: subscribeFunc,
          opts: opts,
          callback: callback
        });
        return callback(err);
      }
      self.getExchange(exchangeName, function(err, exchange) {
        if (err) {
          return callback(err);
        }
        connection.queue(qName, opts, function(q) {
          q.bind(exchange, filter);
          q.subscribe(subscribeFunc);
          callback();
        });
      });
    });

  };

  /**
   * cleanly disconnect from the Cluster
   */
  this.disconnect = function() {
    if (_connection) {
      _connection.disconnect();
    }
  };

  /** Private functions */

  /**
   * Setup the connection
   * @param  {Object} connectCfg AMQP connection configurations.
   * @param  {Object} options    AMQP connection options.
   * See https://github.com/postwait/node-amqp#connection-options-and-url for the format of the connectCfg and options
   */
  function setupConn(connectCfg, options) {
    var conn = amqp.createConnection(connectCfg, options);
    conn.on('ready', function() {
      debug('received ready event from node-amqp');
      var eventName = 'connection';
      //Ready event will be emitted when re-connected.
      //To keep backward compatible, only emit 'connection' event for the first time
      if (_connection) {
        eventName = 'reconnect';
      }
      _connection = conn;
      _connection._isClosed = false;
      self.emit('ready');
      // wrapped in 'nextTick' for unit test friendliness
      process.nextTick(function() {
        debug('going to emit ' + eventName);
        self.emit(eventName);
      });

      autoSubscribe();
      publishCachedMessages();
      _rpcReplyQ = null;
      _rpcReplyQName = null;
      _rpcSubscribed = false;
      if (_.size(_rpcCallbacks) > 0) {
        debug('found ' + _.size(_rpcCallbacks) + ' callbacks left after reconnect');
        //still have callbacks that are waiting for response.However, since we have reconnected, they won't receive the messages
        _.each(_rpcCallbacks, function(cb) {
          return cb('connection_error');
        });
      }
      _rpcCallbacks = {};
    });
    conn.on('error', function(err) {
      self.emit('error', err);
    });
    conn.on('close', function() {
      if (_connection) {
        _connection._isClosed = true;
      }
    });
  }

  /**
   * Re-add subscriber functions that are created when there is no connection
   */
  function autoSubscribe() {
    //re-add pending subscribers
    if (_pendingSubscribers.length > 0) {
      async.each(_pendingSubscribers, function(sub, callback) {
        debug('Add pending subscriber', sub);
        self.subscribeToTopic(sub.exchange, sub.queue, sub.filter, sub.subscriber, sub.opts, function(err) {
          if (err) {
            debug('Failed to add subscriber, keep it', sub);
          } else {
            //done, remove the item from the pending subscribers
            var idx = _pendingSubscribers.indexOf(sub);
            _pendingSubscribers.splice(idx, 1);
            debug('pending subsriber added, now there are ' + _pendingSubscribers.length + ' left');
          }
          return callback();
        });
      }, function() {
        debug('pending subscribers are added');
      });
    }
  }

  /**
   * Re-publish messages that received when there is no connection
   */
  function publishCachedMessages() {
    if (_cachedPublishMessages.length > 0) {
      async.each(_cachedPublishMessages, function(message, callback) {
        debug('republish message', message);
        self.publishTopic(message.exchange, message.topic, message.message, message.options, function(err) {
          if (err) {
            debug('Failed to republish message', message);
          } else {
            var idx = _cachedPublishMessages.indexOf(message);
            _cachedPublishMessages.splice(idx, 1);
            debug('cached publish message re-published, now there are ' + _cachedPublishMessages.length + ' messages left');
          }
          return callback();
        });
      }, function() {
        debug('cached publish messages processed');
      });
    }
  }

  function setupRpcReplyQ(cb) {
    if (!_rpcReplyQ) {
      self.getConnection(function(err, connection) {
        if (err) {
          return cb(err);
        }
        connection.queue('', {exclusive: true}, function(q) {
          _rpcReplyQ = q;
          _rpcReplyQName = q.name + '';
          debug('got queuename : ' + _rpcReplyQName + ' ' + typeof(_rpcReplyQName));
          return cb(null, _rpcReplyQ);
        });
      });
    } else {
      return cb(null, _rpcReplyQ);
    }
  }

  function listenForReply(cb) {
    if (!_rpcSubscribed) {
      setupRpcReplyQ(function(err, queue) {
        if (err) {
          debug('Got error when setup rpc reply queue', err);
          return cb(err);
        }
        queue.subscribe(function(message, headers, deliveryInfo, messageObject) {
          debug('got message', message, headers, deliveryInfo);
          var correlationId = deliveryInfo.correlationId;
          if (correlationId && _rpcCallbacks[correlationId]) {
            _rpcCallbacks[correlationId](null, message, headers, deliveryInfo, messageObject);
            delete _rpcCallbacks[correlationId];
          } else {
            debug('no callback function found for message with correlationId ' + correlationId);
          }
        });
        _rpcSubscribed = true;
        return cb();
      });
    } else {
      return cb();
    }
  }
}

util.inherits(AMQPManager, events.EventEmitter);
exports.AMQPManager = AMQPManager;
exports.EventTypes = require('./fhevents.js');
