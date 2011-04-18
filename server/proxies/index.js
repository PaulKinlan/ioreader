var exceptions = require('../exceptions');

exports.Proxy = function() {
};

/*
  fetchCategories - fetches a list of categories
*/
exports.Proxy.prototype.fetchCategories = function(callback) {
  throw "fetchCategories Not Implemented";
};

/*
  fetchCategory - fetches the category from the service and returns a consistent data structure.
*/
exports.Proxy.prototype.fetchCategory = function(id, callback) {
  throw "fetchCategory Not Implemented";
};
 
exports.Proxy.prototype.fetchArticle = function(id, category, callback) {
  throw "fetchArticle Note Implemented";
};

var cachingProxy = function(proxy) {
  this.proxy = proxy;
  this.cache = {};
}

cachingProxy.prototype.fetchCategories = function(callback) {
  return this.proxy.fetchCategories(callback);
};

cachingProxy.prototype.fetchCategory = function(id, callback) {
  return this.proxy.fetchCategory(id, callback);
};

cachingProxy.prototype.fetchArticle = function(id, category, callback){
  return this.proxy.fetchArticle(id, category, callback);
};

var proxyFactory = new (function() {
  this.create = function(configuration) {
    if(!!configuration == false) throw new exceptions.Exception("Unable to create proxy. No configuration specified");
    var module = require("./" + configuration.id)
    return new cachingProxy(new module.proxy(configuration));
  };
})();

exports.ProxyFactory = proxyFactory;

var ProxyFactoryTests = function() {
  this.createNull = function() {
    var f = new ProxyFactory();
    Assert(null, f.create());
  };
 
  this.createUnknown = function() {
    var f = new ProxyFactory();
    Assert(null, f.create("blek"));
  };

  this.createKnown = function() {
    var f = new ProxyFactory();
    var proxy = f.create("test");
    AssertNotNull(proxy);
    AssertType(typeof(TestProxy), proxy);
  };
};
