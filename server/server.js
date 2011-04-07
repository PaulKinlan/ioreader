var express = require('express');
var app = express.createServer();
var m = require('mustache');
var fs = require('fs');
var async = require('async');
var http = require('http');

var conf = { 
  name: "guardian",
  description: "The Guardian News Reader",
  baseDir: "server/templates/",
  categories: ["technology", "business", "politics", "lifeandstyle", "music", "culture"]
};

var cache = {};

var Proxy = function() {
};

/*
  fetchCategories - fetches a list of categories
*/
Proxy.prototype.fetchCategories = function() {
  throw new Exception("fetchCategories Not Implemented");
};

/*
  fetchCategory - fetches the category from the service and returns a consistent data structure.
*/
Proxy.prototype.fetchCategory = function(id) {
  throw new Exception("fetchCategory Not Implemented");
};
 
Proxy.prototype.fetchArticle = function(id, category) {
  throw new Exception("fetchArticle Note Implemented");
};

var NPRProxy = function(configuration) {
};

NPRProxy.prototype = new Proxy();
NPRProxy.prototype.constructor = Proxy.constructor;

NPRProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new Exception("No Callback defined");
  // Create the url to fetch the articles in a category.  
  var category = new CategoryData(); 

  callback(category);
};

var GuardianProxy = function(configuration) {
  var domain = "content.guardianapis.com";
  var api_key = "ywyfby4r7zsfy2rc8eesk6q3";

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
    if(!!callback == false) throw new NoCallbackException();
    
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
    http.get(options, function(res) {fetchResults(res, callback);} ); 
  };

  this._fetchCategory = function(id, fields, callback) {
    if(!!callback == false) throw new NoCallbackException();
    
    var query = {
      "section": id,
      "show-fields": fields.join(","),
      "format": "json",
      "page-size": "8",
      "show-media": "all",
      "use-date": "last-modified",
      "api-key": api_key
    };

    var options = {
      host: domain,
      port: 80,
      path: '/search?' + toQueryString(query)
    };

    http.get(options, function(res) { fetchResults(res, callback);});
  };

  this._fetchArticle = function(id, category, callback) {
    if(!!callback == false) throw new NoCallbackException();
    
    var query = {
      "format": "json",
      "show-fields": "all",
      "show-media": "all",
      "page-size": "8",
      "api-key": api_key
    };
   
    var options = {
      host: domain,
      port: 80,
      path: "/" + decodeURIComponent(id) + "?" + toQueryString(query)
    }
     
    http.get(options, function(res) {fetchResults(res, callback);});  
  };
};

GuardianProxy.prototype = new Proxy();
GuardianProxy.prototype.constructor = GuardianProxy;

GuardianProxy.prototype.fetchCategories = function(callback) {
  if(!!callback == false) throw new NoCallbackException();
  var self = this;
  var data = this._fetchCategories(conf.categories, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];    
    for(var r in results) {
      var result = results[r];
      var new_category = new CategoryData(result.id, result.webTitle);
      var output_callback = (function(cat) {
        return function(inner_callback) {
          self._fetchCategory(cat.id, ["byline", "standfirst", "thumbnail"], function(category_data) {
            if(!!category_data.response == false) return;
            var cat_results = category_data.response.results;
            
            for(var cat_r in cat_results) {
              var cat_res = cat_results[cat_r];
              if(!!cat_res.fields == false) continue;
              var item = new CategoryItem(cat_res.id, cat_res.webTitle, cat_res.fields.standfirst, cat);
              item.thumbnail = cat_res.fields.thumbnail;
              item.pubDate = cat_res.webPublicationDate;
              item.author = cat_res.fields.byline;
              item.url = cat_res.webUrl;
              item.largeImage = self.findLargestImage(cat_res.mediaAssets).url;
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
  if(!!callback == false) throw new NoCallbackException();
  var self = this;
  var data = this._fetchCategories(conf.categories, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];    
    for(var r in results) {
      var result = results[r];
      var category = new CategoryData(result.id, result.webTitle);
      var output_callback = (function(cat) {
        return function(inner_callback) {
          self._fetchCategory(cat.id, ["all"], function(category_data) {
            if(!!category_data.response == false || category_data.response.status != "ok") return;
            if(cat.id == id) cat.state = "active";
            var cat_results = category_data.response.results;
            for(var cat_r in cat_results) {
              var cat_result = cat_results[cat_r];
              var item = new CategoryItem(cat_result.id, cat_result.webTitle, cat_result.fields.standfirst, cat);
              item.thumbnail = cat_result.fields.thumbnail;
              item.pubDate = cat_result.webPublicationDate;
              item.author = cat_result.fields.byline;
              item.url = cat_result.webUrl;
              item.largeImage = self.findLargestImage(cat_result.mediaAssets).url;
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

GuardianProxy.prototype.fetchArticle = function(id, category, callback) {
  if(!!callback == false) throw new NoCallbackException();
  var self = this;
  this._fetchCategories(conf.categories, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;
    var categories = [];
    var fetching = false;
     
    for(var r in results) {
      var result = results[r];
      var newCat = new CategoryData(result.id, result.webTitle);

      // Get the basic article information to blend it into the results

      var outer_function = (function(cat) { return function(inner_callback) {
        if(cat.id == category) {
          self._fetchArticle(id, cat.id, function(article_data) {
            if(!!article_data.response == false || article_data.response.status != "ok") return;
            var article_result = article_data.response.content;
            var item = new CategoryItem(article_result.id, article_result.webTitle, article_result.fields.trailText, cat);
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

var TestProxy = function(configuration) {
};

TestProxy.prototype = new Proxy();
TestProxy.prototype.constructor = Proxy.constructor;

TestProxy.prototype.fetchCategories = function(callback){
  if(!!callback == false) throw new NoCallbackException();
  var categories = [];
  categories.push(new CategoryData("tech", "Technology"));
  categories.push(new CategoryData("business", "Business"));
  callback(categories);
};
 
TestProxy.prototype.fetchCategory = function(id, callback) {
  if(!!callback == false) throw new NoCallbackException();
 
  var data = {data:1};
  callback(data);
};

var Exception = function() {

};

var NoCallbackException = function() {

};

NoCallbackException.prototype = new Exception();
NoCallbackException.prototype.constructor = Exception.constructor;

var RequiredException = function() {};
RequiredException.prototype = new Exception();
RequiredException.prototype.constructor = Exception.constructor;

/*
  A Basic data holder
*/
var CategoryData = function(id, name) {
  this.id = id; 
  this.name = name;
  this.articles = [];

  /*
   Adds an item in to the category
  */
  this.addItem = function(item) {
    this.articles.push(item);
  };
};

/*
  A data item in the category.
*/
var CategoryItem = function(id, title, shortDescription, category) {
  this.id = encodeURIComponent(id);
  this.title = title;
  this.shortDescription = shortDescription;
  this.thumbnail = "";
  this.categoryId = category.id;
  this.url = function () { return "reader/" + categoryId + "/" + this.id + ".html"; }; 
  this.dataUrl = function () { return "reader/" + categoryId + "/" + this.id + ".json"; };
};

var ProxyFactory = function() {
  // a list of predefined proxies
  var proxies = {"guardian": GuardianProxy, "npr": NPRProxy, "test": TestProxy };
  
  this.create = function(configuration) {
    if(!!configuration == false) throw new Exception("Unable to create proxy. No configuration specified");
    if(!!proxies[configuration.name] == false) throw new Exception(configuration.name + " Proxy doesn't exist.")
    return new proxies[configuration.name](configuration); // this might be a module load instead - need to think about it. 
  };
};

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

var Controller = function(configuration) {
  var proxy = new ProxyFactory().create(configuration);  
  
  /*
    Loads the template from the file system.
  */ 
  var loadTemplate = function(file, callback) {
    if(!!callback == false) throw new NoCallbackException("No callback");
    fs.readFile(file,'utf8', function(err, data) {
      if(err) throw err;
      callback(data);
    });
  };

  /*
    Fetches and renders the categories for a given format.
  */ 
  this.fetchCategories = function(format, callback) {
    if(!!callback == false) throw new NoCallbackException("No callback");
    proxy.fetchCategories(function(data) {
      if(format == "json") {
        callback(JSON.stringify(data));
      }
      else {
        loadTemplate(configuration.baseDir + "index." + format, function(template) {
          callback(m.to_html(template, {"categories" : data}));
        });
      }
    }); 
  };

  /*
    For a given category fetch and render the list of articles.
  */
  this.fetchCategory = function(id, format, callback) {
    if(!!id == false) throw new Exception("Category id not specified");
    if(!!callback == false) throw new NoCallbackException("No callback");
    
    proxy.fetchCategory(id, function(data) {
      // Render the data. 
      if(format == "json") {
        callback(JSON.stringify({categories: data}));
      }
      else {
        loadTemplate(configuration.baseDir + "category." + format, function(template) {
          callback(m.to_html(template, {"categories": data})); 
        });
      }
    }); 
  };

  this.fetchArticle = function(id, category, format, callback) {
    if(!!id == false) throw new Exception("Article id not specified");
    if(!!callback == false) throw new NoCallbackException("No callback");
    proxy.fetchArticle(id, category, function(data) {
      // Render the data. 
      if(format == "json") {
        callback(JSON.stringify({categories: data}));
      }
      else {
        loadTemplate(configuration.baseDir + "article." + format, function(template) {
          callback(m.to_html(template, {"categories": data})); 
        });
      }
    }); 
  };
};

var ControllerTests = function() {
  var controller = new Controller({name: "test"});

  var fetchCategoriesTestNoCallback = function() {
    Assert(controller.fetchCategories());
  };

  var fetchCategoryTestNoCallback = function() {
    Assert(controller.fetchCategory(""));
  };

  var fetchCategoryTestNoName = function() {
    Assert(controller.fetchCategory());
  };

  var fetchArticleTestNoCallback = function() {
    Assert(controller.fetchArticle(""));
  };

  var fetchArticleTestNoName = function() {
    Assert(controller.fetchArticle());
  };
};

/* 
  By default the code runs in test mode.  This means it use the development versions of the code but uses a dummy "test" data source.
*/
app.configure(function() {
  app.use(app.router);
});

app.configure('test', function() {
  app.use(express.static(__dirname + '/client/'));
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  conf.name = "test"; // force test mode.
  console.log("Running in Test");
});

/* 
  Development mode runs all the code uncompressed
*/
app.configure('development', function() {
  app.use(express.static(__dirname + '/client/'));
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  console.log("Running in Development");
});

/*
  Production mode, is nearly the same as development mode, but all the client-side code
  is minified.  Exceptions are not shown either.
*/
app.configure('production', function() {
  app.use(express.static(__dirname + '/client-min/'));
  console.log("Running in Production");
});

app.get('/', function(req, res) {
  var format = "html"; 
  var controller = new Controller(conf);
  if(cache[req.url]) {
    bustCache(res).send(cache[req.url]);
  }
  else {
    controller.fetchCategories(format, function(output) { 
      cache[req.url] = output;
      bustCache(res).send(output);
    });
  }
});

app.get('/index.:format', function(req, res) {
  var format = req.params.format;
  var controller = new Controller(conf);
  if(cache[req.url]) {
    bustCache(res).send(cache[req.url]);
  }
  else {
    controller.fetchCategories(format, function(output) { 
      cache[req.url] = output;
      bustCache(res).send(output);
    });
  }
});

app.get('/reader/:category.:format?', function(req, res) {
  var category = req.params.category;
  var format = req.params.format || "html";
  var controller = new Controller(conf);
  // request the category list i

  if(cache[req.url]) {
    bustCache(res).send(cache[req.url]);
  }
  else {
    controller.fetchCategory(category, format, function(output) { 
      cache[req.url] = output;
      bustCache(res).send(output);
    });
  }
});

app.get('/reader/:category/:article.:format?', function(req, res) {
  var category = req.params.category;
  var article = req.params.article;
  var format = req.params.format || "html";
  var controller = new Controller(conf);
  if(cache[req.url]) {
    bustCache(res).send(cache[req.url]);
  }
  else {
    controller.fetchArticle(article, category, format, function(output) { 
      cache[req.url] = output;
      bustCache(res).send(output);
    });
  }
});

function bustCache(res) {
  res.header("Expires","Mon, 26 Jul 1997 05:00:00 GMT");
  res.header("Last-Modified", +new Date);
  res.header("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
  res.header("Cache-Control", "post-check=0, pre-check=0");
  res.header("Pragma","no-cache");
  return res;
}

app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');
