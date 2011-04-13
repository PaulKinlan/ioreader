var proxies = require('../../proxies');
var fs = require('fs');
var exceptions = require('../../exceptions');

var TestProxy = function(configuration) {
};

TestProxy.prototype = new proxies.Proxy();
TestProxy.prototype.constructor = proxies.Proxy;

TestProxy.prototype.fetchCategories = function(callback){
  if(!!callback == false) throw new exception.NoCallbackException();
  var categories = [];
  var filename = "server/proxies/test/index.json";
  
  fs.readFile(filename,'utf8', function(err, data) {
    if(err) throw err;
    callback(JSON.parse(data));
  });
};
 
TestProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new exception.NoCallbackException();
  var categories = [];
  var filename = "server/proxies/test/category.json";
  
  fs.readFile(filename,'utf8', function(err, data) {
    if(err) throw err;
    callback(JSON.parse(data));
  });
};

TestProxy.prototype.fetchArticle = function(id, callback) {
  if(!!callback == false) throw new exception.NoCallbackException();
  var categories = [];
  var filename = "server/proxies/test/article.json";
  
  fs.readFile(filename,'utf8', function(err, data) {
    if(err) throw err;
    callback(JSON.parse(data));
  });
};

exports.proxy = TestProxy;
