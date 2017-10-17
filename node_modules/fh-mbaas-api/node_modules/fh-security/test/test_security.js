var util = require('util');
var assert = require('assert');
var async = require('async');
var sec = require('../lib/security.js').security;

module.exports = {
  'test keygen': function(){
    sec({act:'keygen', params: {algorithm:'AES'}}, function(err, result){
      assert.isDefined(err);
    });
    sec({act:'keygen', params:{algorithm: 'AES', keysize: 128}}, function(err, result){
      assert.isUndefined(err);
      assert.isNotNull(result.secretkey);
      assert.isNotNull(result.iv);
    });
    sec({act:'keygen', params:{algorithm:'RSA', keysize: 1024}}, function(err, result){
      assert.isUndefined(err);
      assert.isNotNull(result.public);
      assert.isNotNull(result.private);
      assert.isNotNull(result.modulu);
    });
    sec({act:'keygen'}, function(err, result){
      assert.isDefined(err);
    });
  },

  'test aes encrypt/decrypt': function(){
    var plaintext = 'This is test text';
    var keySizes = [128, 256];
    async.eachSeries(keySizes, function testUsingKeySize(keySize, cb) {
      console.log('test encrypt/decrypt with keySize: ', keySize);
      sec({act:'keygen', params:{algorithm: 'AES', keysize: keySize}}, function(err, result){
        assert.isUndefined(err, "unexpected error when doing keygen with keySize: " + keySize);
        assert.equal(result.iv.length, 32, "IV is incorrect length: " + 32);
        sec({act:'encrypt', params:{algorithm:'AES', key: result.secretkey, iv: result.iv, plaintext:plaintext}}, function(e, r){
          assert.isUndefined(e, "unexpected error when encrypting with keySize: " + keySize);
          var ciphertext = r.ciphertext;
          sec({act:'decrypt', params:{algorithm:'AES', key: result.secretkey, iv: result.iv, ciphertext:ciphertext}}, function(de, dr){
            assert.equal(dr.plaintext, plaintext, "decrypted text not matching original test when encrypting with keySize: " + keySize);
            return cb();
          });
        });
      });
    }, function(err) {
      assert.ok(!err, 'unexpected error from aes encrypt/decrypt run');
    });

    sec({act:'encrypt', params:{algorithm:'AES'}}, function(err, result){
      assert.isDefined(err);
    });
  },

  'test rsa encrypt/decrypt': function(){
    var plaintext = 'This is test text';
    sec({act:'keygen', params:{algorithm:'RSA', keysize: 1024}}, function(err, result){
      assert.isUndefined(err);
      sec({act:'encrypt', params:{algorithm:'RSA', plaintext:plaintext, public: result.public}}, function(e, r){
        assert.isUndefined(e);
        sec({act:'decrypt', params:{algorithm:'RSA', ciphertext:r.ciphertext, private: result.private}}, function(de, dr){
          assert.isUndefined(de);
          assert.equal(plaintext, dr.plaintext);
        });
      });
    });
  },

  'test hashing': function(){
    var text = 'This is test text';
    sec({act:'hash', params: {algorithm:'md5', text: text}}, function(err, result){
      assert.isUndefined(err);
      assert.isDefined(result.hashvalue);
    });
    sec({act:'hash', params: {algorithm:'sha1', text: text}}, function(err, result){
      assert.isUndefined(err);
      assert.isDefined(result.hashvalue);
    });
    sec({act:'hash', params: {algorithm:'sha256', text: text}}, function(err, result){
      assert.isUndefined(err);
      assert.isDefined(result.hashvalue);
    });
    sec({act:'hash', params: {algorithm:'sha512', text: text}}, function(err, result){
      assert.isUndefined(err);
      assert.isDefined(result.hashvalue);
    });
  }
}
