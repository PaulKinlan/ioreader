var proxies = require('../../proxies');
var exceptions = require('../../exceptions');

var NPRProxy = function(configuration) {
};

NPRProxy.prototype = new proxies.Proxy();
NPRProxy.prototype.constructor = proxies.Proxy.constructor;

NPRProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new exceptions.Exception("No Callback defined");
  // Create the url to fetch the articles in a category.  
  var category = new CategoryData(); 

  callback(category);
};

exports.proxy = NPRProxy;
