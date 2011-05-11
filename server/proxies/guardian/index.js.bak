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

var http = require('http');
var async = require('async');
var proxies = require('../../proxies');
var exceptions = require('../../exceptions');
var model = require('../../model');

var Cache = function(timeout) {
  var cache = {};
  var cacheCallback = {};
  var timeout = timeout;

  var clearCacheItem = function(key) {
    console.log("Removing: " + key);
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

var httpCache = new Cache(60 * 5);

var GuardianProxy = function(configuration) {
  var domain = "content.guardianapis.com";
  var api_key = "ywyfby4r7zsfy2rc8eesk6q3";


  this.configuration = configuration;
  
  var fetchResults = function(res, callback) {
    var data = "";
    res.setEncoding('utf-8');
    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      try {
        callback(JSON.parse(data));
      } catch(ex) {
        console.log("error parsing data - maybe remote API is throttling or down?", res);
        callback({});
      }
    });
  };

  var toQueryString = function(opts) {
    var qs = []; 
   
    for(var q in opts) {
      qs.push(encodeURIComponent(q) + "=" + opts[q]);
    }
    return qs.join("&");
  };

  var makeRequest = function(options, callback) {
    var path = options.path;
    var item = httpCache.get(path);
    if(item) {
      callback(item);
      return;
    }
    else {
     http.get(options, function(res) {
       fetchResults(res, function(data) {
         httpCache.add(path, data);
         callback(data);
       });
     }); 
    }
  };
 
  this._fetchCategories = function(categories, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException();
    
    var query = {
      "q": categories.join("+"),
      "format": "json",
      "show-media": "all",
      "page-size": "8",
      "api-key": api_key
    };

    var options = {
      host: domain, 
      port: 80,
      path: '/sections?' + toQueryString(query) 
    };

    makeRequest(options, callback);
  };

  this._fetchCategory = function(id, fields, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException();
    
    var query = {
      "section": id,
      "show-fields": fields.join(","),
      "format": "json",
      "page-size": "8",
      "tag": "type%2farticle",
      "show-media": "all",
      "use-date": "last-modified",
      "api-key": api_key
    };

    var options = {
      host: domain,
      port: 80,
      path: '/search?' + toQueryString(query)
    };

    makeRequest(options, callback);
  };

  this._fetchArticle = function(id, category, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException();
    
    var query = {
      "format": "json",
      "show-fields": "all",
      "show-media": "all",
      "api-key": api_key
    };
   
    var options = {
      host: domain,
      port: 80,
      path: "/" + decodeURIComponent(id) + "?" + toQueryString(query)
    }
     
    makeRequest(options, callback);
  };
};

GuardianProxy.prototype = new proxies.Proxy();
GuardianProxy.prototype.constructor = proxies.GuardianProxy;

GuardianProxy.prototype.fetchCategories = function(callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  var self = this;
  var data = this._fetchCategories(this.configuration.categories, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];    
    for(var r in results) {
      var result = results[r];
      var new_category = new model.CategoryData(result.id, result.webTitle);
      var output_callback = (function(cat) {
        return function(inner_callback) {
          self._fetchCategory(cat.id, ["byline", "standfirst", "thumbnail"], function(category_data) {
            if(!!category_data.response == false) return;
            var cat_results = category_data.response.results;
            
            for(var cat_r in cat_results) {
              var cat_res = cat_results[cat_r];
              if(!!cat_res.fields == false) continue;
              var item = self.createItem(cat_res, cat);
              cat.addItem(item);
            }
            inner_callback(null, cat);
          });
        };
      })(new_category);
      categories.push(output_callback); 
    }

    // execute the category requests in parallel.
    async.parallel(categories, function(err, results){ callback(results); });
  });
};

GuardianProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  var self = this;
  var data = this._fetchCategories(this.configuration.categories, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];    
    for(var r in results) {
      var result = results[r];
      var category = new model.CategoryData(result.id, result.webTitle);
      var output_callback = (function(cat) {
        return function(inner_callback) {
          self._fetchCategory(cat.id, ["thumbnail","byline","standfirst"], function(category_data) {
            if(!!category_data.response == false || category_data.response.status != "ok") return;
            if(cat.id == id) cat.categoryState = "active";
            var cat_results = category_data.response.results;
            var cat_result;

            for(var r = 0; cat_result = cat_results[r]; r++) {
              var item = self.createItem(cat_result, cat);
              cat.addItem(item); 
            }
            
            inner_callback(null, cat);
           });
        };
      })(category);
      categories.push(output_callback);
    }

    async.parallel(categories, function(err, presults){ callback(presults); });
  });
};

GuardianProxy.prototype.findLargestImage = function(mediaAssets) {
  var asset;
  var largest = {size: 0, x: 0, y:0, url:""};

  if(!!mediaAssets == false) return largest;

  for(var i = 0; asset = mediaAssets[i]; i++) {
    if(asset.type != "picture") continue;
    var size = parseInt(asset.fields.width,10) * parseInt(asset.fields.height,10);
    if(size > largest.size) {
      largest = {size: size, x: asset.fields.width, y: asset.fields.height, url: asset.file };
    }
  }
  return largest;
};

GuardianProxy.prototype.createItem = function(article_result, cat) {
  var item = new model.CategoryItem(article_result.id, article_result.webTitle, "", cat);
  if(article_result.fields) {
    item.shortDescription = article_result.fields.trailText || article_result.fields.standfirst;
    item.thumbnail = article_result.fields.thumbnail;
    item.author = article_result.fields.byline;
    
    if(!!article_result.fields.body)
      item.body = article_result.fields.body.replace(/\n/gim,"").replace(/\r/gim,"");
  }

  if(!!item.thumbnail == false) {
    item.imageState = "textonly";
  }
  
  item.largeImage = this.findLargestImage(article_result.mediaAssets).url;
  item.pubDate = new Date(article_result.webPublicationDate);
  item.url = article_result.webUrl;
  return item;
};

GuardianProxy.prototype.fetchArticle = function(id, currentCategory, callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  console.log("Enter Fetch Article");
  var self = this;
  var data = this._fetchCategories(this.configuration.categories, function(data) {
    console.log("Fetch Categories");
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];    
    for(var r in results) {
      var result = results[r];
      var category = new model.CategoryData(result.id, result.webTitle);
      var output_callback = (function(cat) {
        return function(inner_callback) {
          self._fetchCategory(cat.id, ["byline", "standfirst", "thumbnail"], function(category_data) {
            console.log("Fetched Category");
            if(!!category_data.response == false || category_data.response.status != "ok") return;
            if(cat.id == currentCategory) cat.categoryState = "active";
            var articleFound = false;
            var cat_results = category_data.response.results;
            var cat_result;
            var activeArticleOffset = -1;

            for(var r = 0; cat_result = cat_results[r]; r++) {
              if(cat_result.id == id) { 
                activeArticleOffset = r;
              }
              var item = self.createItem(cat_result, cat);
              cat.addItem(item); 
            }
            
            self._fetchArticle(id, cat.id, function(article_data) {
              if(!!article_data.response == false || article_data.response.status != "ok") return;
              var article_result = article_data.response.content;
              var item  = self.createItem(article_result, cat)
              item.articleState = "active";
              if(activeArticleOffset == -1) cat.addItem(item); 
              else cat.articles[activeArticleOffset] = item;
              inner_callback(null, cat);
            }); 
          });
        };
      })(category);
      categories.push(output_callback);
    }

    async.parallel(categories, function(err, presults){ callback(presults); });
  });
};

exports.proxy = GuardianProxy;
