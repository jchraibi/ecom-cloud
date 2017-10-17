fh-amqp-js
==========

[![npm package](https://nodei.co/npm/fh-amqp-js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fh-amqp-js/)

[![Build status](https://img.shields.io/travis/feedhenry/fh-amqp-js/master.svg?style=flat-square)](https://travis-ci.org/feedhenry/fh-amqp-js)
[![Dependency Status](https://img.shields.io/david/feedhenry/fh-amqp-js.svg?style=flat-square)](https://david-dm.org/feedhenry/fh-amqp-js)
[![Known Vulnerabilities](https://snyk.io/test/npm/fh-amqp-js/badge.svg?style=flat-square)](https://snyk.io/test/npm/fh-amqp-js)


FeedHenry AMQP client wrapper for communication with a Rabbit cluster.

|                 | Project Info  |
| --------------- | ------------- |
| License:        | Apache License, Version 2.0  |
| Build:          | npm  |
| Documentation:  | http://docs.feedhenry.com/v3/api/cloud_api.html  |
| Issue tracker:  | https://issues.jboss.org/projects/FH/summary  |
| Mailing list:   | [feedhenry-dev](https://www.redhat.com/archives/feedhenry-dev/) ([subscribe](https://www.redhat.com/mailman/listinfo/feedhenry-dev))  |
| IRC:            | [#feedhenry](https://webchat.freenode.net/?channels=feedhenry) channel in the [freenode](http://freenode.net/) network.  |

Overview
--------

The FeedHenry Platform includes a RabbitMQ cluster, which is set up to have highly available [Mirrored Queues](http://www.rabbitmq.com/ha.html). The messaging pattern that best suits our development requirements is the 'Topic' pattern, described in the RabbitMQ [documentation](http://www.rabbitmq.com/tutorials/tutorial-five-python.html).

This client library helps with the following:

* Automatic detection of Rabbit node failure and reconnecting to another node in the Rabbit Cluster. NOTE: all rabbitmq servers in the cluster need to be runnning on the same port, protocol and authentication method.

* Easier handling connection and subscibers when RabbitMQ is down

* 'publishTopic' and 'subscribeToTopic' type functions that set up correct Exchange and Q configuration behind the scenes.

* Option to cache messages that need to be published when RabbitMQ is down and re-publish them automatically when connection is backup.

* If you need, you can also use 'getConnection' and 'getExchange' to create exchanges & queues that suit your needs.

This module can also be used from the command line, to quick publish a message to the FeedHenry Rabbit Cluster, or also as a handy way to quickly subscribe to FeedHenry messages.

API
----------

## Constructor

### fhamqpjs.AMQPManager(cfg)

* cfg (Object) - Specify the AMQP connection details and other connection options.

  * cfg.clusterNodes

    This is required. The clusterNodes can be either an array of amqp URIs, or the connection configuration object specified in https://github.com/postwait/node-amqp#connection-options-and-url. If the clusterNodes are an array of amqp URIs, they will be converted to node-amqp connection configuration. E.g.

      * 'amqp://guest:guest@host1.example.com:5672/test'
      * ['amqp://guest:guest@host1.example.com:5672/test', 'amqp://host2.example.com:5672/test']
      * {'host':['host1.example.com', 'host2.example.com'], port: 5672, login: 'guest', password:'guest', connectionTimeout: 10000}

  * cfg.options

    You can specify node AMQP specific options that can be passed down to node-amqp (e.g. Reconnecting configurations), or if publish messages should be cached if connection is lost:

      * reconnect - enable/disabled auto reconnect. Default is true.
      * reconnectBackoffStrategy - strategy for reconnecting. 'Linear' or 'exponential'. Default is 'linear'.
      * reconnectBackoffTime - If use 'linear' as the reconnect strategy, the default waiting time (ms) before retrying. Default is 5000.
      * reconnectExponentialLimit - If use 'exponential' as the reconnect strategy, the maxium waiting time (ms)before retrying. Default is 120000.
      * cachePublish - If messages to be published should be cached. Default is false.
      * maxCachePublishSize - If caching is enabled, the maxium number of messages should be cached. Default is 1000.

## Methods

### connectToCluster()

Establish the RabbitMQ connection

### getConnection(cb)

Get the current established RabbitMQ connection. It's an instance of the [node-amqp Connection](https://github.com/postwait/node-amqp/blob/master/lib/connection.js).

* cb (Function) - function(err, connection){}

### getExchange(name, opts, cb)

Get/create an exchange with the given name and options.

* name (String) - The name of the exchange
* opts (Object) - The options for the exchange. This is optional. If not specified, the default options will be used.
  * defaults: {type:'topic', durable: true, confirm: true, autoDelete: false}
* cb (Function) - function(err, exchange){}

### publishTopic(exchangeName, topic, message, cb)

Publish a topic message to the exchange. If 'cachePublish' is set to true in cfg.options when the AMQPManager is constructed, the messages will be cached in memory if RabbitMQ is down and then re-published automatically once the connection is back. You can also control the maxium number of messages to cache via 'maxCachePublishSize' in cfg.options. This feature is off by default, and the default maxium number of messages to cache is 1000.

* exchangeName (String) - The name of the exchange.
* topic (String) - The topic of the message.
* message (String) - The message to send
* opts (Object) - The options for the message. This is optional.
  * defaults: {type:'application/json', deliveryMode: 2}
* cb (Function) - function(err){}. If error is not null, it means there is a problem with the connection and the message is not published. However, if the caching feature is enabled, the message will published once the connection is re-established.

### subscribeToTopic(exchangeName, qName, filter, subscribeFunc, opts, cb)

Subscribe to a topic. Even if the connection is down at the time when this function called, the AMQPManager will automatically add the subscriber once the connection is restored. So you don't need to care about the status of the connection when this method is called.

* exchangeName (String) - The name of the exchange. If empty string, the default topic exchange will be used.
* qName (String) - The name of the queue.
* filter (String) - The pattern to filter the messages.
* subscribeFunc (Function) - The function to subscribe.
* opts (Object) - The option for the queue. This is optional.
  * defaults: {durable: true, autoDelete: false}
* cb (Function) - function(err){}. If error is not null, it means there is a problem with the connection and can not subscribe to it at the moment. However, it will be subscribed again once there is a valid connection.

### ping(cb)

Quickly check if there is a valid RabbitMQ connection before publishing/subscribing to a exchange/queue. This could be useful if the application needs to make sure the message bus is alive before pub/sub.

* cb (Function) - function(err){}. If error is not null, it means there is no valid connection to the message bus.

### disconnect()

Disconnect from the message queue.

## Events

The following events will be emmitted by the AMQPManager:

### ready

This event is emmitted *EVERYTIME* when the connection is established.

### connection

This event is only emmitted the very first time when connection to the RabbitMQ is established since the component is started.

### reconnect

This event is emmitted when there is a reconnect happened.

### error

This event is emmitted when there is an error. The error object will be passed to the listener.
Normally in your application, you should just log the error and do not try to reconnect or stop the service. The AMQPManager will try to reconnect automatically. Even if your application should not be running when RabbitMQ is down, you should probably count the number of errors (or add a delay) before you decide to stop the application.

The AMQPManager also inherits from the EventEmitter, so all the methods of EventEmitter are also available.

Module Usage
------------

Sample [sub.js](https://github.com/fheng/fh-amqp-js/blob/master/examples/sub.js):

```javascript
var fhamqpjs = require('../lib/amqpjs.js');
var cfg = {
  clusterNodes: "amqp://guest:guest@dummy.feedhenry.me:5672",
  maxReconnectAttempts: 10  // specifies how may connection failures to attempt before giving up.
};

var amqpManager = new fhamqpjs.AMQPManager(cfg);
amqpManager.connectToCluster();

//just subscribe. Even if RabbitMQ is down, this subscriber will be added automatically once RabbitMQ is back.
amqpManager.subscribeToTopic("fh-topic1", "fh-topic-1", "fh.#", subscribeFunc, function(err){
  if(err) console.error("Fatal error setting up subscriber: ", err);
});

// error handler: just log. Do not try to reconnect or quit.
amqpManager.on("error", function(err){
  console.log("Fatal error: ", err);
});

// the function that gets called each time a message is recieved
function subscribeFunc (json, headers, deliveryInfo) {
  console.log("GOT MESSAGE: ", json);
};
```

Sample [pub.js](https://github.com/fheng/fh-amqp-js/blob/master/examples/pub.js):

```javascript
var fhamqpjs = require('../lib/amqpjs.js');
var cfg = {
  clusterNodes: "amqp://guest:guest@dummy.feedhenry.me:5672",
  maxReconnectAttempts: 10,
  options: {
    cachePublish: true
  }
};

var amqpManager = new fhamqpjs.AMQPManager(cfg);
amqpManager.connectToCluster();

var t; var count=0;
if (t) clearInterval(t);
t = setInterval(function(){
  console.log("Publishing message: " + count);
  amqpManager.publishTopic("fh-topic1", "fh.event.count", {count: count++}, function(err){
    if (err) console.error("Fatal publishing error: ", err);
  });
}, 1000);

amqpManager.on("error", function(err){
  console.log("Fatal error: ", err);
});

```

Reconnecting
-------------

Since release 0.3, this module will support reconnecting to the rabbitmq servers if it restarts. If the current connected rabbit server is disconnected for whatever reason, this module will automatically try to connect to another host (if there are multiple hosts specified) or the same host (if only one is specified) based on reconnect strategy. It enables the reconnect function that is supported by the node-amqp module: https://github.com/postwait/node-amqp#connection-options-and-url.

The default reconnect options are:

```javascript
{
  reconnect: true,
  reconnectBackoffStrategy: 'linear',
  reconnectBackoffTime: 5000
}
```

To override, you can set an `options` field on the configuration object passed to the AMQPManager:

```javascript
var cfg = {
  clusterNodes: ["amqp://guest:guest@dummy.feedhenry.me:5672/fh-events"],
  options: {
    reconnectBackoffStrategy: 'exponential',
    reconnectExponentialLimit: 120000
  }
};
```

You can also set other options that is supported by node-amqp module in the `options` field.

You can also specify the `clusterNodes` option as connection options that is supported by node-amqp:

```javascript
var cfg = {
  clusterNodes: {
    host:['rabbitserver1.com', 'rabbitserver2.com'],
    port: 5672,
    login: 'guest',
    password: 'guest'
  }
}
var amqpManager = new fhamqpjs.AMQPManager(cfg);
amqpManager.connectToCluster();
```

NOTE: all rabbitmq servers in the cluster need to be runnning on the same port, protocol and authentication method.


CLI Usage
---------

    Usage: fh-amqp-js pub <exchange> <topic> <message> --clusterNodes=[<amqp-url>,*]
    fh-amqp-js sub <exchange> <topic> --clusterNodes=[<amqp-url>,*]


The Command Line Interface can be used to quickly publish messages, e.g.

    $ fh-amqp-js pub "fh-topic2" "fh.event.count" '{"count": 1}' --clusterNodes='["amqp://guest:guest@dummy.feedhenry.me:5672"]'

There is also a 'sub' command, for quickly subscribing to messages:

    $ fh-amqp-js sub "fh-topic2" "fh.event.count" --clusterNodes='["amqp://guest:guest@dummy.feedhenry.me:5672"]'

Configuration:

The CLI uses the [RC](https://github.com/dominictarr/rc) node module for incredibly flexible config finding (see its documentation). Config options currently are:

```javascript
{
  clusterNodes: ["amqp://guest:guest@dummy.feedhenry.me:5672/fh-events"],
  maxReconnectAttempts: 10  // specifies how may connection failures to attempt before giving up.
}
```

Development
-----------

To run the tests:

    make test

or:

    make test-coverage-cli

or:

    make test-coverage-html

Build artifacts are located on Denzil here: http://denzil.henora.net:8080/view/common/job/fh-amqp-js/
