# fh-component-metrics 

This component is used to gather metrics such as CPU and memory usage. Using InfluxDB and 
Grafana you can easily visualise the metrics.

The following docker image was used to build the necessary infrastructure
to investigate this:
https://github.com/StackPointCloud/docker-influxdb

# Influxdb Version

The 2.x version of this component is compatible with 0.10 release of Influxdb. It is using the line protocol to send metrics data over UDP port. Please make sure UDP is enabled in the Influxdb configurations.

# Usage Guide

Here are the steps to use this module in an existing RHMAP component:

1. add this module as a dependency:

    ```
    npm install fh-component-metrics --save
    ```

2. Then you can capture CPU & memory usage in the component use this code:

    ```
    var fhComponentMetrics = require('fh-component-metrics');
    var metricsConf = {enabled: true, host: '1.2.3.4', port: 2003, baseTags: {appId: process.env.APPID}};
    var metrics = fhComponentMetrics(metricsConf);
    var TITLE = 'myTestComponent';
    metrics.memory(TITLE, { interval: 2000 }, function(err) {
      if (err) logger.warn(err);
    });

    metrics.cpu(TITLE, { interval: 1000 }, function(err) {
      if (err) logger.warn(err);
    });
    ```

3. Send metrics data to multiple backends. By default, if you only need to send metrics data to an Influxdb backend, you can specify the configuration as the example above. But it also supports some other backends like Statsd and it can send the metrics data to multiple backends at the same time. To do that, you just need to change the configuration and replace the `host` and `port` value with an array called `backends`:

   ```
   var fhComponentMetrics = require('fh-component-metrics');
   var metricsConf = {enabled: true, backends:[{type: 'influxdb', host: '1.2.3.4', port: 2003}, {type: 'statsd', host: '1.2.3.4', port: 2004}], baseTags: {appId: process.env.APPID}};
   var metrics = fhComponentMetrics(metricsConf);
   //the metrics data will be sent to both the influxdb and statsd backend
   ```

At the moment, it supports Influxdb, Statsd and redis, so the valid options for the `type` field are `influxdb`, `statsd` and `redis`. See the next section for more details about the available options for each type.

4. To capture API time, you can add the timingMiddleware to an existing express app like this:

    ```
    var fhComponentMetrics = require('fh-component-metrics');
    var metricsConf = {enabled: true, host: '1.2.3.4', port: 2003, baseTags: {appId: process.env.APPID}};
    var app = express();
    app.use(fhComponentMetrics.timingMiddleware('myExpressApp', metricsConf));
    ```

5. It's better the add the metrics configuration into the component's configuation file. E.g.

    ```
    {
      ...,
      "component_metrics": {
        "enabled": true,
        "host": "1.2.3.4",
        "port": 2003
      },
      ...
    }
    ```

# Configuration Options for Each Backend Type

## Influxdb

* host: the host of the influxdb
* port: the port of the influxdb. It has to be a UDP port.

## Statsd

* host: the host of the statsd server
* port: the port of the statsd server. It has to be a UDP port.
* keyBuilder: a function that will allow override how the metric key is being built. If not provided, a default function will be provided. See [statsd.js](./lib/clients/statsd.js) for more details.

NOTE: each metric will be formatted as described in this [spec](https://github.com/b/statsd_spec) before sending to the server.

## Redis

* redisClient: an instance of https://github.com/NodeRedis/node_redis#rediscreateclient. 
* recordsToKeep: how many records to keep in redis
* namespace: a prefix that will be added to each metric key

NOTE: each record will be added to a list in Redis. The key for the list is the metric name. Each record will is a stringified JSON object, with the follow fields:

* tags
* fields
* ts

# Limitations

CPU metrics are supported only on Linux based operating systems.
