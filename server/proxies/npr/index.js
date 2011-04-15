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
      console.log(data);
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
      "apiKey": api_key,
      "id": id
    };
   
    var options = {
      host: domain,
      port: 80,
      path: "/query?" + toQueryString(query)
    };
    console.log("Article");
    console.log(options);
     
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
          
          for(var r = 0; cat_res = cat_results[r]; r++) {
            cat.addItem(self.createItem(cat_res, cat));
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

NPRProxy.prototype.createItem = function(cat_res, cat) {
  var item = new model.CategoryItem(cat_res.id, cat_res.title.$text, "", cat);
  if(cat_res.teaser) item.shortDescription = cat_res.teaser.$text;
  if(cat_res.thumbnail) item.thumbnail = cat_res.thumbnail.large.$text;
  if(cat_res.storyDate) item.pubDate = cat_res.storyDate.$text;
  if(cat_res.byline && cat_res.byline.name) item.author = cat_res.byline.name.$text;
  item.url = parseLinkType(cat_res.link, "html");
  item.largeImage = this.findLargestImage(cat_res.image).url;
            
  return item;
};

NPRProxy.prototype.fetchArticle = function(id, category, callback) {
  if(!!callback == false) throw new exceptions.NoCallbackException();
  var self = this;
  var categories = [];
  var c;  
  for(var i = 0; c = self.configuration.categories[i]; i++) {
    var new_category = new model.CategoryData(c, "");
    var output_callback = (function(cat) {
      return function(inner_callback) {
        self._fetchCategory(cat.id, ["all"], function(category_data) {
          var cat_results = category_data.list.story;
          var articleFound = false;
          cat.name = category_data.list.title.$text; 
          for(var r = 0; cat_res = cat_results[r]; r++) {
            if(cat_res.id == id) articleFound = true;
            cat.addItem(self.createItem(cat_res, cat));
          }

          if(c == cat.id && articleFound == false) {
            // We should fetch the article if it is not found and do the callback then
            self._fetchArticle(id, category, function(article_data) {
              cat.addItem(self.createItem(article_data, cat));
              inner_callback(null, cat);  
            });
          }
          else {
            inner_callback(null, cat);
          }
        });
      };
    })(new_category);
    categories.push(output_callback); 
  }

  categories.push();
  async.parallel(categories, function(err, presults){ callback(presults); });
};

exports.proxy = NPRProxy;
