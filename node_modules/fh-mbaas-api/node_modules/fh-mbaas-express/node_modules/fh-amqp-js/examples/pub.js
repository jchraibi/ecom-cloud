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

// note we clear the timer on each (re)connection
var t;
var count=0;

if (t) {
  clearInterval(t);
}

t = setInterval(function() {
  console.log("Publishing message: " + count);
  amqpManager.publishTopic("fh-topic1", "fh.event.count", {count: count++}, function(err) {
    if (err) {
      console.error("Fatal publishing error: ", err);
    }
  });
}, 1000);

amqpManager.on("error", function(err) {
  console.log("Fatal error: ", err);
});
