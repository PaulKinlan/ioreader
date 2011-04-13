var express = require('express');
var proxies = require('./proxies');
var exception = require('./exceptions');
var logic = require('./controller');

var app = express.createServer();

var conf = { 
  id: "guardian",
  name: "The Guardian News Reader",
  description: "All the latest from around the world",
  version: "0.0.0.1",
  baseDir: __dirname + "/templates/",
  clientDir: __dirname + "/client/",
  categories: ["technology", "business", "politics", "lifeandstyle", "music", "culture"]
};

var cache = {};

/* 
  By default the code runs in test mode.  This means it use the development versions of the code but uses a dummy "test" data source.
*/
app.configure(function() {
  app.use(app.router);
});

app.configure('test', function() {
  app.use(express.static(conf.clientDir));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  conf.id = "test"; // force test mode.
  console.log("Running in Test");
});

/* 
  Development mode runs all the code uncompressed
*/
app.configure('development', function() {
  app.use(express.static(conf.clientDir));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  console.log("Running in Development");
});

/*
  Production mode, is nearly the same as development mode, but all the client-side code
  is minified.  Exceptions are not shown either.
*/
app.configure('production', function() {
  conf.clientDir = __dirname + "/client-min";
  app.use(express.static(cond.clientDir));
  console.log("Running in Production");
});

app.get('/', function(req, res) {
  var format = "html"; 
  var controller = new logic.Controller(conf);
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
  var controller = new logic.Controller(conf);
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

/*
 *  The AppCache.
 */
app.get('/app.cache', function(req, res) {
  var controller = new logic.Controller(conf);
  controller.renderAppCache(function(output) {
    res.header("Content-type: text/manifest\n\n");
    res.send(output);
  });  
});

app.get('/reader/:category.:format?', function(req, res) {
  var category = req.params.category;
  var format = req.params.format || "html";
  var controller = new logic.Controller(conf);
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
  var controller = new logic.Controller(conf);
  
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
