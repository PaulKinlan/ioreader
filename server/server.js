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

var express = require('express');
var proxies = require('./proxies');
var exception = require('./exceptions');
var logic = require('./controller');

var app = express.createServer();

var conf = { 
  id: "guardian",
  name: "DEMO: Reader for Guardian",
  description: "All the latest news from around the world",
  version: "0.0.0.1",
  baseDir: __dirname + "/templates/",
  clientDir: __dirname + "/client/",
  categories: ["technology", "business", "politics", "lifeandstyle", "music", "culture"]
};
/*
var conf = { 
  id: "npr",
  name: "The NPR News Reader",
  description: "All the latest from around the world",
  version: "0.0.0.1",
  baseDir: __dirname + "/templates/",
  clientDir: __dirname + "/client/",
  categories: ["1019"]
};
*/

function bustCache(req, res, next) {
  res.setHeader("Expires","Mon, 26 Jul 1997 05:00:00 GMT");
  res.setHeader("Last-Modified", +new Date);
  res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Cache-Control", "post-check=0, pre-check=0");
  res.setHeader("Pragma","no-cache");
  next();
}

var Cache = function(timeout) {
  var cache = {};
  var clearCacheItem = function(url) {
    console.log("Removing " + url + "_from cache. ");
    delete cache[url];
  };

  return function(req, res, next){
    var url = req.url;
    if(!!cache[url] == false) {
      next();
      var end = res.end;
      res.end = function(data, encoding) {
        res.end = end;
        cache[url] = data;

        setTimeout(function() { clearCacheItem(url); }, timeout * 1000);

        res.end(data, encoding);
      }
    }
    else {
      res.send(cache[url]);
    }
  };
};

var CSSHandler = function() {
  return function(req, res) {
    // This makes massive assumptions.
    var file = req.params.file;
    var formfactor = file.replace(".css", "");
    var fs = require('fs');
    require.paths.push("./server/libs");
    var less = require('less');
    var paths = {
      "desktop" : "desktop/desktop.less", 
      "tablet" : "tablet/tablet.less", 
      "tv" : "tv/tv.less", 
      "phone" : "phone/phone.less",
      "reset" : "reset.css"
    }
    // Fetch Base.less
    fs.readFile(__dirname + "/client/css/base.less", function(err, baseData) {
      // Fetch actual CSS
      fs.readFile(__dirname + "/client/css/" + paths[formfactor], function(err, cssData) {
        // Merge 
        //res.send(baseData + "\n" + cssData);
        less.render(baseData + "\n" + cssData, function(err, cssOutput) {
          res.header('Content-Type', 'text/css');
          res.send(cssOutput);
        });
      });
    });
  };
};

/* 
  By default the code runs in test mode.  This means it use the development versions of the code but uses a dummy "test" data source.
*/
app.configure(function() {
  app.use(app.router);
});

app.configure('test', function() {
  app.get("/css/:file", CSSHandler() );
  app.use(express.static(conf.clientDir));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  conf.id = "test"; // force test mode.
  console.log("Running in Test");
});

/* 
  Development mode runs all the code uncompressed
*/
app.configure('development', function() {
  app.get("/css/:file", CSSHandler() );

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
  app.use(express.static(conf.clientDir));
  console.log("Running in Production");
});

app.get('/', Cache(6), function(req, res) {
  var format = "html"; 
  var controller = new logic.Controller(conf);
  
  controller.fetchCategories(format, function(output) { 
    res.send(output);
  });
});

app.get('/index.:format', Cache(6), function(req, res) {
  var format = req.params.format;
  var controller = new logic.Controller(conf);
  
  controller.fetchCategories(format, function(output) { 
    res.send(output);
  });
});

/*
 *  The AppCache.
 */
app.get('/app.cache', function(req, res) {
  var controller = new logic.Controller(conf);
  res.header("Content-Type", "text/cache-manifest");
  controller.renderAppCache(function(output) {
    res.send(output);
  });  
});

app.get('/reader/:category.:format?', Cache(6), function(req, res) {
  var category = req.params.category;
  var format = req.params.format || "html";
  var controller = new logic.Controller(conf);
  // request the category list i

  controller.fetchCategory(category, format, function(output) { 
    res.send(output);
  });
});

app.get('/reader/:category/:article.:format?', Cache(6), function(req, res) {
  var category = req.params.category;
  var article = req.params.article;
  var format = req.params.format || "html";
  var controller = new logic.Controller(conf);
  
  controller.fetchArticle(article, category, format, function(output) { 
    res.send(output);
  });
});

app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');
