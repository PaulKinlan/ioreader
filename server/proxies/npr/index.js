var proxies = require('../../proxies');
var http = require('http');
var async = require('async');
var exceptions = require('../../exceptions');
var model = require('../../model');

var NPRProxy = function(configuration) {
  var domain = "api.npr.org";
  var api_key = "MDA3MjEwMzA3MDEzMDA4OTc4MjkzYmU0Nw001";
  this.configuration = configuration;

  var fetchResults = function(res, callback) {
    var data = "";
    res.setEncoding('utf-8');
    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      callback(JSON.parse(data));
    });
  };

  var toQueryString = function(opts) {
    var qs = []; 
   
    for(var q in opts) {
      qs.push(encodeURIComponent(q) + "=" + opts[q]);
    }
    return qs.join("&");
  };
 
  this._fetchCategories = function(categories, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException();
    
    var query = {
      "id": categories.join(","),
      "format": "JSON",
      "apiKey": api_key
    };

    var options = {
      host: domain, 
      port: 80,
      path: '/list?' + toQueryString(query) 
    };
    http.get(options, function(res) {fetchResults(res, callback);} ); 
  };

  this._fetchCategory = function(id, fields, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException();
    
    var query = {
      "id": id,
      "fields": fields.join(","),
      "format": "JSON",
      "requireAssets": "image",
      "apiKey": api_key
    };

    var options = {
      host: domain,
      port: 80,
      path: '/query?' + toQueryString(query)
    };

    http.get(options, function(res) { fetchResults(res, callback);});
  };

  this._fetchArticle = function(id, category, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException();
    
    var query = {
      "format": "JSON",
      "show-fields": "all",
      "show-media": "all",
      "page-size": "8",
      "apiKey": api_key
    };
   
    var options = {
      host: domain,
      port: 80,
      path: "/" + decodeURIComponent(id) + "?" + toQueryString(query)
    }
     
    http.get(options, function(res) {fetchResults(res, callback);});  
  };
};

var parseLinkType = function(urls, type) {
  for(var i = 0; url = urls[i]; i++) {
    if(url.type == type) return url.$text;
  }
  return null;
};

NPRProxy.prototype = new proxies.Proxy();
NPRProxy.prototype.constructor = proxies.GuardianProxy;

NPRProxy.prototype.fetchCategories = function(callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  var self = this;
  var categories = [];
  var category;  
  for(var i = 0; category = self.configuration.categories[i]; i++) {
    var new_category = new model.CategoryData(category, "");
    var output_callback = (function(cat) {
      return function(inner_callback) {
        self._fetchCategory(cat.id, ["title","audio","image","thumbnail"], function(category_data) {
          var cat_results = category_data.list.story;
          cat.name = category_data.list.title.$text; 
          for(var cat_r in cat_results) {
            var cat_res = cat_results[cat_r];
            console.log(cat_res);
            var item = new model.CategoryItem(cat_res.id, cat_res.title.$text, "", cat);
            if(cat_res.teaser) item.shortDescription = cat_res.teaser.$text;
            if(cat_res.thumbnail) item.thumbnail = cat_res.thumbnail.large.$text;
            if(cat_res.storyDate) item.pubDate = cat_res.storyDate.$text;
            if(cat_res.byline) item.author = cat_res.byline.name.$text;
            item.url = parseLinkType(cat_res.link, "html");
            item.largeImage = self.findLargestImage(cat_res.image).url;
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
};

NPRProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  var self = this;
  var categories = [];
  var category;  
  for(var i = 0; category = self.configuration.categories[i]; i++) {
    var new_category = new model.CategoryData(category, "");
    var output_callback = (function(cat) {
      return function(inner_callback) {
        self._fetchCategory(cat.id, ["all"], function(category_data) {
          var cat_results = category_data.list.story;
          cat.name = category_data.list.title.$text; 
          for(var cat_r in cat_results) {
            var cat_res = cat_results[cat_r];
            console.log(cat_res);
            var item = new model.CategoryItem(cat_res.id, cat_res.title.$text, "", cat);
            if(cat_res.teaser) item.shortDescription = cat_res.teaser.$text;
            if(cat_res.thumbnail) item.thumbnail = cat_res.thumbnail.large.$text;
            if(cat_res.storyDate) item.pubDate = cat_res.storyDate.$text;
            if(cat_res.byline) item.author = cat_res.byline.name.$text;
            item.url = parseLinkType(cat_res.link, "html");
            item.largeImage = self.findLargestImage(cat_res.image).url;
            cat.addItem(item);
          }
          inner_callback(null, cat);
        });
      };
    })(new_category);
    categories.push(output_callback); 
  }
 
  async.parallel(categories, function(err, presults){ callback(presults); });
};

NPRProxy.prototype.findLargestImage = function(mediaAssets) {
  var asset;
  var largest = {x: 0, url:""};

  if(!!mediaAssets == false) return largest;

  for(var i = 0; asset = mediaAssets[i]; i++) {
    var x = parseInt(asset.width); 
    if(x > largest.x) {
      largest = {x: x, url: asset.src };
    }
  }
  return largest;
};

NPRProxy.prototype.fetchArticle = function(id, category, callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  var self = this;
  this._fetchCategories(this.configuration.categories, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];
    var fetching = false;
     
    for(var r in results) {
      var result = results[r];
      var newCat = new model.CategoryData(result.id, result.webTitle);

      // Get the basic article information to blend it into the results

      var outer_function = (function(cat) { return function(inner_callback) {
        if(cat.id == category) {
          self._fetchArticle(id, cat.id, function(article_data) {
            if(!!article_data.response == false || article_data.response.status != "ok") return;
            var article_result = article_data.response.content;
            var item = new model.CategoryItem(article_result.id, article_result.webTitle, article_result.fields.trailText, cat);
            if(!!article_result.fields.body)
              item.body = article_result.fields.body.replace(/\"/gim,'\\"').replace(/\n/gim,"").replace(/\r/gim,"");
            item.thumbnail = article_result.fields.thumbnail;
            item.largeImage = self.findLargestImage(article_result.mediaAssets).url;
            item.pubDate = article_result.webPublicationDate;
            item.author = article_result.fields.byline;
            item.url = article_result.webUrl;
            cat.addItem(item);
      
            inner_callback(null, cat);
          }); 
        }
        else {
          inner_callback(null, cat);
        }
      }
      })(newCat);
      categories.push(outer_function);
    }
    // If there is no matching category, it will lock.
    async.parallel(categories, function(err, presults){ callback(presults); });
  }); 
};

exports.proxy = NPRProxy;
