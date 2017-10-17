var crypto = require("crypto");
var util = require("util");

var $fh = global.$fh;

var security = function(params, cb) {
  var act = params.act;
  var p = params.params;
  if (!p) {
    return cb('params are missing');
  }
  if (act === "keygen") {
    return generateKey(p, cb);
  } else if (act === "getkey") {
    return getKey(p, cb);
  } else if (act === "savekey") {
    return saveKey(p, cb);
  } else if (act === "encrypt") {
    return encrypt(p, cb);
  } else if (act === "decrypt") {
    return decrypt(p, cb);
  } else if (act === "hash") {
    return doHash(p, cb);
  } else {
    return cb("invalid act: " + act);
  }
};

function generateKey(params, cb) {
  var alg = params.algorithm;
  var keysize = params.keysize;
  if (!alg) {
    return cb('algorithm is missing');
  }
  if (!keysize) {
    return cb('keysize is missing');
  }
  if (alg.toLowerCase() === "aes") {
    crypto.randomBytes(keysize/8, function(err, buf) {
      if (err) {
        return cb(err);
      }
      // All AES encryption uses 128 bit block size, the IV length should match the block size
      crypto.randomBytes(128/8, function(err, iv) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, {secretkey: buf.toString('hex'), 'iv': iv.toString('hex')});
      });
    });
  } else if (alg.toLowerCase() === "rsa") {
    var NodeRsa;
    try {
      NodeRsa = require("node-rsa");
    } catch (e) {
      console.log(util.inspect(e));
      return cb("ursa module is not installed, hence RSA key generation is not supported.");
    }
    var keypair = new NodeRsa({b:keysize});
    return cb(undefined, {"public": keypair.exportKey('public'), "private": keypair.exportKey('private'),"modulu":keypair.keyPair.n.toString(16)});
  } else {
    return cb("Unsupported keygen algorithm : " + alg);
  }
}

function encrypt(params, cb) {
  var alg = params.algorithm;
  if (!alg) {
    return cb('algorithm is missing');
  }
  var plaintext = params.plaintext;
  if (!plaintext) {
    return cb('plaintext is missing');
  }
  if (alg.toLowerCase() === "aes") {
    var secretkey = params.key;
    if (!secretkey) {
      return cb('secretkey is missing');
    }
    var keysize = Buffer.byteLength(secretkey, "hex")*8;
    var cipheralg = "aes-" + keysize + "-cbc";
    var iv = params.iv;
    var cipher = null;
    if (iv) {
      cipher = crypto.createCipheriv(cipheralg, new Buffer(secretkey, "hex").slice(0,keysize/8), new Buffer(iv, "hex").slice(0,128/8));
    } else {
      cipher = crypto.createCipher(cipheralg, new Buffer(secretkey, "utf8").slice(0,keysize/8));
    }
    ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");
    cb(undefined, {ciphertext: ciphertext});
  } else if (alg.toLowerCase() === "rsa") {
    var pubkey = params.public;
    if (!pubkey) {
      return cb('public key is missing');
    }
    var NodeRsa;
    try {
      NodeRsa = require("node-rsa");
    } catch (e) {
      return cb("ursa module is not installed, hence RSA key generation is not supported.");
    }
    pubkey = new NodeRsa(pubkey);
    var ciphertext = pubkey.encrypt(new Buffer(plaintext, "utf8"));
    cb(undefined, {ciphertext: ciphertext});
  } else {
    cb("Unsupported encryption algorithm: " + alg);
  }
}

function decrypt(params, cb) {
  var alg = params.algorithm;
  var ciphertext = params.ciphertext;
  if (!ciphertext) {
    return cb('ciphertext is missing');
  }
  if (alg.toLowerCase() === "aes") {
    var secretkey = params.key;
    if (!secretkey) {
      return cb("secretkey is missing");
    }
    var keysize = Buffer.byteLength(secretkey, "hex")*8;
    var cipheralg = "aes-" + keysize + "-cbc";
    var iv = params.iv;
    var decipher = null;
    if (iv) {
      decipher = crypto.createDecipheriv(cipheralg, new Buffer(secretkey, "hex").slice(0,keysize/8), new Buffer(iv, "hex").slice(0,128/8));
    } else {
      decipher = crypto.createDecipher(cipheralg, new Buffer(secretkey, "utf8").slice(0,keysize/8));
    }
    var plaintext = decipher.update(ciphertext, "hex", "utf8");
    plaintext += decipher.final("utf8");
    cb(undefined, {plaintext: plaintext});
  } else if (alg.toLowerCase() === "rsa") {
    var privatekey = params.private;
    if (!privatekey) {
      return cb('privatekey is missing');
    }
    var NodeRsa;
    try {
      NodeRsa = require("node-rsa");
    } catch (e) {
      return cb("ursa module is not installed, hence RSA key generation is not supported.");
    }
    var privkey = new NodeRsa(privatekey);
    var plaintxt = privkey.decrypt(new Buffer(ciphertext, "hex"));
    cb(undefined, {plaintext: plaintxt});
  } else {
    cb("Unsupported decryption algorithm: " + alg);
  }
}

function doHash(params, cb) {
  var alg = params.algorithm;
  var text = params.text;
  if (!alg) {
    return cb('algorithm is missing');
  }
  if (!text) {
    return cb('text is missing');
  }
  var hasher = crypto.createHash(alg);
  hasher.update(text, "utf8");
  var hashvalue = hasher.digest("hex");
  return cb(undefined, {hashvalue: hashvalue});
}

function getKey(params, cb) {
  var id = params.id;
  var keyType = params.keytype;
  if (!id) {
    return cb('key id is missing');
  }
  if (!keyType) {
    return cb('keyType is missing');
  }
  getKeyImpl(id, keyType, function(err, key) {
    if (err) {
      return cb(err);
    }
    return cb(undefined, key);
  });
}

function saveKey(params, cb) {
  var id = params.id;
  var keyType = params.keytype;
  var keyValue = params.key;
  if (!id) {
    return cb('key id is missing');
  }
  if (!keyType) {
    return cb('keyType is missing');
  }
  if (!keyValue) {
    return cb('keyValue is missing');
  }
  saveKeyImpl(id, keyType, keyValue, function(err, keyObj) {
    if (err) {
      return cb(err);
    }
    return cb(undefined, keyObj);
  });
}

var getKeyImpl = function(id, type, cb) {
  if (typeof $fh !== "undefined" && $fh.db) {
    $fh.db({
      act:'list',
      'type': 'securityKeys',
      eq: {
        "id": id,
        "keyType": type
      }
    }, function(err, data) {
      if (err) {
        return cb(err);
      }
      if (data.count > 0) {
        return cb(undefined, data.list[0].fields.keyValue);
      } else {
        return cb(undefined, undefined);
      }
    });
  } else {
    console.log("$fh.db not defined");
    cb("$fh.db not defined");
  }
};

var saveKeyImpl = function(id, type, value, cb) {
  if (typeof $fh !== "undefined" && $fh.db) {
    $fh.db({
      act:'list',
      'type': 'securityKeys',
      eq: {
        "id": id,
        "keyType": type
      }
    }, function(err, data) {
      if (err) {
        return cb(err);
      }
      if (data.count > 0) {
        $fh.db({
          'act':'update',
          'type': 'securityKeys',
          'guid': data.list[0].guid,
          'fields' : {
            'id': id,
            'keyType': type,
            'keyValue' : value
          }
        }, function(err, result) {
          if (err) {
            return cb(err);
          }
          return cb(undefined, result);
        });
      } else {
        $fh.db({
          'act': 'create',
          'type': 'securityKeys',
          'fields': {
            'id' : id,
            'keyType': type,
            'keyValue': value
          }
        }, function(err, result) {
          if (err) {
            return cb(err);
          }
          return cb(undefined, result);
        });
      }
    });
  } else {
    console.log("$fh.db not defined");
    cb("$fh.db not defined");
  }
};

exports.security = security;

