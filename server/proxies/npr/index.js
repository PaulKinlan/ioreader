var proxies = require('../../proxies');

var NPRProxy = function(configuration) {
};

NPRProxy.prototype = new proxies.Proxy();
NPRProxy.prototype.constructor = proxies.Proxy.constructor;

NPRProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new Exception("No Callback defined");
  // Create the url to fetch the articles in a category.  
  var category = new CategoryData(); 

  callback(category);
};
