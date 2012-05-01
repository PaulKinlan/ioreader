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

var httpCache = new proxies.Cache(60 * 5);

var GoogleFeedProxy = function(configuration) {
  if(!!!configuration.options.proxies.googlefeed.referer) throw "A HTTP Referer needs to be set use the Google Feed API.  Check your configuration file.";
  
  var options = configuration.options.proxies.googlefeed;
  var referer = options.referer;
  var domain = "ajax.googleapis.com";
  var path = "/ajax/services/feed/load";

  this.configuration = configuration;
  var self = this;
  
  var fetchResults = function(res, callback) {
    var data = "";
    res.setEncoding('utf-8');
    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      var output = {};

      try {
        output = JSON.parse(data);
      } catch(ex) {
        console.log("error parsing data - maybe remote API is throttling or down?", ex,  data);
      }

      callback(output);
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

  this._fetchCategory = function(id, callback) {
    if(!!!callback) throw new exceptions.NoCallbackException();

    var qs = {
      v: "1.0",
      q: id 
    };

    var params = {
      path: path + "?" + toQueryString(qs),
      host: domain,
      port: 80
    };

    makeRequest(params, callback);
  };

  var buildId = function(url) {
    var id;
    var urlParts = url.split("/");

    while(urlParts.length > 0) {
      var path = urlParts.pop();
      if(path != "")
        return path;
    }
    
    return;
  };
  
  var findArticle = function(results, id) {
    var result, articles, article;
    for(var r = 0; result = results[r]; r++) {
      // We have a list of articles
      articles = result.responseData.feed.entries; 
      for(var a = 0; article = articles[a]; a++) {
        if(buildId(article.link) == id) {
          return article;
        }
      }
    }

    return null;
  };

  var findLargestImage = function(mediaGroups) {
    var asset;
    var largest;

    if(!!!mediaGroups) return largest;
    for(var g = 0; group = mediaGroups[g]; g++) {
      for(var i = 0; asset = group.contents[i]; i++) {
        var size = parseInt(asset.width,10) * parseInt(asset.height,10);
        if(!!!largest || size > largest.size ) {
          largest = {size: size, width: asset.width, height: asset.height, url: asset.url };
          if(!!asset.thumbnails)
            largest.thumbnail = assets.thumbnails[0].url;
        }
      }
    }
    return largest;
  };

  var parseResults = function(results, output, categoryId, articleId) {
    var result, articles, article, feed;
    for(var r = 0; result = results[r]; r++) {
      // We have a list of articles
      if(!!!result.reseponseData) continue;
      feed = result.responseData.feed;
      articles = feed.entries; 
      if(output[r].id == categoryId) output[r].categoryState = "";
      for(var a = 0; article = articles[a]; a++) {
        var newId = buildId(article.link);
        var image = findLargestImage(article.mediaGroups);
        var item = new model.CategoryItem(
          newId, 
          article.title,
          article.contentSnippet,
          output[r]
        );
        item.author = article.author || feed.author; 
        item.url = article.link;
        item.pubDate = new Date(article.publishedDate);
        
        if(!!image) {
          item.thumbnail = image.thumbnail;
          item.largeImage = image; 
        }

        if(articleId == item.id) {
          item.body = article.content;
          item.articleState = "active";
        }

        if(!!!item.thumbnail) {
          item.imageState = "textonly";
        }

        output[r].addItem(item);
      }
    }

    return output;
  };

  this._buildCategories = function(categories, activeCategory, activeArticle) {
    return function(callback) {
      var output = [];
      // For each category (RSS feed), fetch
      var category;
      var tasks = [];

      for(var i = 0; category = categories[i]; i++) {
        var categoryData = new model.CategoryData(category.id, category.title, category.url); 
        output.push(categoryData);
        tasks.push(self._buildCategory(category));
      }

      async.series(
        tasks,
        function (err, results) {
          parseResults(results, output, activeCategory, activeArticle);
          callback(null, output, results[0]);
        }
      );
    };
  };

  this._buildCategory = function(category) {
    return function(callback) {
      self._fetchCategory(category.url, function(data) {
        callback(null, data); 
      });
    }; 
  };

};

GoogleFeedProxy.prototype = new proxies.Proxy();
GoogleFeedProxy.prototype.constructor = proxies.GoogleFeedProxy;

GoogleFeedProxy.prototype.fetchCategories = function(callback) {
  if(!!!callback) throw new exceptions.NoCallbackException();
  var self = this;

  async.waterfall([
      self._buildCategories(self.configuration.categories)
    ],
    function(err, result) {
      callback(result);
    }
  );
};

GoogleFeedProxy.prototype.fetchCategory = function(currentCategory, callback) {
  if(!!!callback) throw new exceptions.NoCallbackException();
  var self = this;
  
  async.waterfall([
      self._buildCategories(self.configuration.categories, currentCategory),
    ],
    function(err, result) {
      callback(result);
    } 
  );
};

GoogleFeedProxy.prototype.fetchArticle = function(currentArticle, currentCategory, callback) {
  if(!!!callback) throw new exceptions.NoCallbackException();
  var self = this;
  async.waterfall([
    self._buildCategories(self.configuration.categories, currentCategory, currentArticle),
   ],
   function(err, result) {
     callback(result);
   } 
  );
};

exports.proxy = GoogleFeedProxy;
