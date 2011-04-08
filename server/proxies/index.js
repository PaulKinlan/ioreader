exports.Proxy = function() {
};

/*
  fetchCategories - fetches a list of categories
*/
exports.Proxy.prototype.fetchCategories = function() {
  throw "fetchCategories Not Implemented";
};

/*
  fetchCategory - fetches the category from the service and returns a consistent data structure.
*/
exports.Proxy.prototype.fetchCategory = function(id) {
  throw "fetchCategory Not Implemented";
};
 
exports.Proxy.prototype.fetchArticle = function(id, category) {
  throw "fetchArticle Note Implemented";
};

var proxyFactory = new (function() {
  this.create = function(configuration) {
    if(!!configuration == false) throw new Exception("Unable to create proxy. No configuration specified");
    var module = require("./" + configuration.name)
    return new  module.proxy(configuration);
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
