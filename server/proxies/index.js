/*   
   Copyright 2011 Google Inc

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var exceptions = require('../exceptions');

exports.Cache = function(timeout) {
  var cache = {};
  var cacheCallback = {};
  var timeout = timeout;

  var clearCacheItem = function(key) {
    delete cache[key];
    delete cacheCallback[key]
  };

  this.add = function(key, value, itemTimeout) {
    timeout = itemTimeout || timeout;
    if(cacheCallback[key]) clearTimeout(cacheCallback[key]);
    cache[key] = value;
    cacheCallback[key] = setTimeout(function() { clearCacheItem(key); }, timeout * 1000);
  };

  this.get = function(key) {
    var result = cache[key];
    return result; 
  };
};



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
    if(!!configuration.options == false) throw "Options need to be defined in the configuration";
    if(!!configuration.options.proxies == false) throw "Proxy options need to be defined in the configuration";
    if(!!configuration.options.proxies[configuration.id] == false) throw "Proxy options for the " + configuration.id  + " need to be defined in the configuration";
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
