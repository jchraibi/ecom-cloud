var fhamqpjs = require('../lib/amqpjs.js');
var cfg = {
  clusterNodes: "amqp://guest:guest@dummy.feedhenry.me:5672",
  maxReconnectAttempts: 10  // specifies how may connection failures to attempt before giving up.
};

var amqpManager = new fhamqpjs.AMQPManager(cfg);
amqpManager.connectToCluster();

// Note that the 'connection' event will fire every time a connection is made to a different Rabbit Node in the cluster (i.e. if the first node we're connected to fails, this connection event will fire when we get connected to the next node in the cluster. Somewhat suboptimal but can't do much about it currently.

amqpManager.subscribeToTopic("fh-topic1", "fh-topic-1", "fh.#", subscribeFunc, function(err) {
  console.error("Fatal error setting up subscriber: ", err);
});

// error handler: something fatal (like can't connect to any nodes in a cluster) needs to happen for this to fire.
amqpManager.on("error", function(err) {
  console.log("Fatal error: ", err);
});

// the function that gets called each time a message is recieved
function subscribeFunc(json, headers, deliveryInfo) {
  console.log("GOT MESSAGE: ", json);
}
