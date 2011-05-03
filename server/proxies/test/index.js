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
