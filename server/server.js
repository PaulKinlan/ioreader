var express = require('express');
var app = express.createServer();
var m = require('mustache');
var fs = require('fs');

var conf = {
  name: "test",
  description: "The Guardian News Reader",
  baseDir: "../client/",
  categories: {
    "Technology": { 
      name: "Technology",
      description: "Technology News as you need it",
      display: "list",
      url: "tech" // Url = "tech"/
    }
  }
};

var Proxy = function() {
  
  var fetch = function() {

  };
};

/*
  fetchCategory - fetches the category from the service and returns a consistent data structure.
*/
Proxy.prototype.fetchCategory = function(name) {
  throw new Exception("fetchCategory Not Implemented");
};
 
Proxy.prototype.fetchArticle = function(id) {
  throw new Exception("fetchArticle Note Implemented");
};

var NPRProxy = function(configuration) {
  var urlStructure = ""
};

NPRProxy.prototype = new Proxy();
NPRProxy.prototype.constructor = Proxy.constructor;

NPRProxy.prototype.fetchCategory = function(name, callback) {
    if(!!callback == false) throw new Exception("No Callback defined");
    // Create the url to fetch the articles in a category.  
    var category =  new CategoryData(); 
    var data = fetchCategory(name);

    // for(var item in data.items) 
    {
      var newItem = new CategoryItem();
      category.addItem(newItem);     
    }

    callback(category);
  };
};

var GuardianProxy = function(configuration) {
  this.fetchCategory = function(name) {};
};

GuardianProxy.prototype = new Proxy();
GuardianProxy.prototype.constructor = Proxy.constructor;

var TestProxy = function(configuration) {
};

TestProxy.prototype = new Proxy();
TestProxy.prototype.constructor = Proxy.constructor;

TestProxy.prototype.fetchCategories = function(callback){
  if(!!callback == false) throw new NoCallbackException();
  callback({"data": 1});
};
 
TestProxy.prototype.fetchCategory = function(name, callback) {
  if(!!callback == false) throw new NoCallbackException();
 
  var data = {data:1};
  callback(data);
};

var Exception = function() {

}

var NoCallbackException = function() {

};

NoCallbackException.prototype = Exception;
NoCallbackException.prototype.constructor = Exception;

/*
  A Basic data holder
*/
var CategoryData = function() {
  this.name = function() {}
  this.items = [];

  /*
   Adds an item in to the category
  */
  this.addItem = function(item) {
    this.items.push(item);
  };
};

/*
  A data item in the category.
*/
var CategoryItem = function(title, shortDescription, longDescription) {
  this.title = title;
  this.shortDescription = shortDescription;
  this.longDescription = longDescription;
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
   
  var loadTemplate = function(file, callback) {
    fs.readFile(file, function(err, data) {
      if(err) throw err;
      callback(data);
    });
  };
 
  this.fetchCategories = function(format, callback) {
    if(!!callback == false) throw new NoCallbackException("No callback");
    
    proxy.fetchCategories(function(data) {
      // Render the data. 
      var template = loadTemplate(configuration.baseDir + "index." + format);
      callback(m.to_html(template, data)); 
    }); 
  };

  this.fetchCategory = function(name, callback) {
    if(!!name == false) throw new Exception("Category name not specified");
    if(!!callback == false) throw new NoCallbackException("No callback");
    
    proxy.fetchCategory(name, function(data) {
      // Render the data. 
      var template = loadTemplate(configuration.baseDir + "category." + format);
      callback(m.to_html(template, data)); 
    }); 
  };

  this.fetchArticle = function(name, callback) {
    if(!!name == false) throw new Exception("Article name not specified");
    if(!!callback == false) throw new NoCallbackException("No callback");
    
    proxy.fetchArticle(name, function(data) {
      // Render the data. 
      var template = loadTemplate(configuration.baseDir + "article." + format);
      callback(m.to_html(template, data)); 
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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/* 
  Development mode runs all the code uncompressed
*/
app.configure('development', function() {
  app.use(express.static(__dirname + '../client'));
});

/*
  Production mode, is nearly the same as development mode, but all the client-side code
  is minified.  Exceptions are not shown either.
*/
app.configure('production', function() {
  app.use(express.static(__dirname + '../client'));
  app.use(express.errorHandler());
});

app.get('/index.:format', function(req, res) {
  var format = req.params.format;
  var controller = new Controller(conf);

  controller.fetchCategories(function(output) { 
    res.send(output);
  });
});

/*
app.get('/:category', function(req, res) {
  var category = req.params.category;
  
  // fetch the category html.
  var controller = new Controller(conf);
  controller.fetchCategory(name, function(output) { 
    res.send(output);
  });
});*/

app.get('/:category.:format', function(req, res) {
  var category = req.params.category;
  var format = req.params.format;
  var controller = new Controller(conf);
   
  // request the category list i
  controller.fetchArticle(category, function(output) { 
    res.send(output);
  });
});

app.get('/:category/:article.:format', function(req, res) {
  var category = req.params.category;
  var article = req.params.article;
  var format = req.params.format;
  var controller = new Controller(conf);

  controller.fetchArticle(category, name, function(output) { 
    res.send(output);
  });
});

app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');
