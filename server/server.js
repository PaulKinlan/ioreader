var express = require('express');
var app = express.createServer();
var m = require('mustache');
var fs = require('fs');
var proxies = require('./proxies');

var conf = { 
  name: "guardian",
  description: "The Guardian News Reader",
  baseDir: "server/templates/",
  categories: ["technology", "business", "politics", "lifeandstyle", "music", "culture"]
};

var cache = {};

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

var Controller = function(configuration) {
  var proxy = proxies.ProxyFactory.create(configuration);  
  
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
