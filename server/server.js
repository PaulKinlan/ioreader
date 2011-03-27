var express = require('express');
var app = express.createServer();
var m = require('mustache');
var fs = require('fs');

var conf = { 
  name: "test",
  description: "The Guardian News Reader",
  baseDir: "client/templates/",
  categories: {
    "technology": { 
      name: "Technology",
      description: "Technology News as you need it",
      display: "list",
      url: "tech" // Url = "tech"/
    }
  }
};

var Proxy = function() {
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
  var category = new CategoryData(); 

  callback(category);
};

var GuardianProxy = function(configuration) {
  var domain = "content.guardianapis.com";
  var api_key = "";

  this._fetchCategory = function(name, callback) {
    if(!!callback == false) throw new NoCallbackException();
    
    var client = http.createClient(80, categoryQuery);
    var headers = {
      section: name,
      fields: "all",
      format: "json",
      use-date: "last-modified",
      api-key: api_key;
    };

    var req = client.request('GET', "/search", headers);

    req.on('response', function(response) {
      var data = ""; 
      response.on('data', function(chunk) {
        data += chunk;
      });

      response.on('end', function() {
        callback(JSON.stringify(data));
      });
    });
    req.end();
  };

  this._fetchArticle = function(id, callback) {
    if(!!callback == false) throw new NoCallbackException();
    
    var client = http.createClient(80, categoryQuery);
    var headers = {
      format: "json",
      fields: "all",
      api-key: api_key; 
    };

    var req = client.request('GET', "/" + id, headers);

    req.on('response', function(response) {
      var data = ""; 
      response.on('data', function(chunk) {
        data += chunk;
      });

      response.on('end', function() {
        callback(JSON.stringify(data));
      });
    });
    req.end();
  };
};

GuardianProxy.prototype = new Proxy();
GuardianProxy.prototype.constructor = GuardianProxy;

GuardianProxy.prototype.fetchCategory = function(name, callback) {
  if(!!callback == false) throw new NoCallbackException();
  
  var category = new CategoryData();

  var data = this._fetchCategory(name, function(data) {
    if(!!data.response == false || data.response.status != "ok") return; 
    var results = data.response.results;

    for(var r in results) {
      var result = results[r];
      var item = new CategoryItem(result.id, result.webTitle, results.fields.standfirst);
      category.addItem(item); 
    }

    callback(category);
  });

};

GuardianProxy.prototype.fetchArticle = function(name, callback) {

};


var TestProxy = function(configuration) {
};

TestProxy.prototype = new Proxy();
TestProxy.prototype.constructor = Proxy.constructor;

TestProxy.prototype.fetchCategories = function(callback){
  if(!!callback == false) throw new NoCallbackException();
  
  var category = new CategoryData();
  category.addItem(new CategoryItem("XOOM Rock"));

  callback();
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

NoCallbackException.prototype = new Exception();
NoCallbackException.prototype.constructor = Exception.constructor;

var RequiredException = function() {};
RequiredException.prototype = new Exception();
RequiredException.prototype.constructor = Exception.constructor;

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
var CategoryItem = function(id, title, shortDescription) {
  this.id = id;
  this.title = title;
  this.shortDescription = shortDescription;
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
      var template = loadTemplate(configuration.baseDir + "index." + format, function(template) {
        callback(m.to_html(template, data));
      });
    }); 
  };

  /*
    For a given category fetch and render the list of articles.
  */
  this.fetchCategory = function(name,format, callback) {
    if(!!name == false) throw new Exception("Category name not specified");
    if(!!callback == false) throw new NoCallbackException("No callback");
    
    proxy.fetchCategory(name, function(data) {
      // Render the data. 
      var template = loadTemplate(configuration.baseDir + "category." + format);
      callback(m.to_html(template, data)); 
    }); 
  };

  this.fetchArticle = function(name, format, callback) {
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
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('test', function() {
  console.log("Running in Test");
});

/* 
  Development mode runs all the code uncompressed
*/
app.configure('development', function() {
  console.log("Running in Development");
});

/*
  Production mode, is nearly the same as development mode, but all the client-side code
  is minified.  Exceptions are not shown either.
*/
app.configure('production', function() {
  console.log("Running in Production");
});

app.get('/', function(req, res) {
  var format = "html"; 
  var controller = new Controller(conf);
  controller.fetchCategories(format, function(output) { 
    res.send(output);
  });
});

app.get('/index.:format', function(req, res) {
  var format = req.params.format;
  var controller = new Controller(conf);
  controller.fetchCategories(format, function(output) { 
    res.send(output);
  });
});

app.get('/:category', function(req, res) {
  var category = req.params.category;
  
  // fetch the category html.
  var controller = new Controller(conf);
  controller.fetchCategory(name, "html", function(output) { 
    res.send(output);
  });
});

app.get('/:category.:format', function(req, res) {
  var category = req.params.category;
  var format = req.params.format;
  var controller = new Controller(conf);
   
  // request the category list i
  controller.fetchCategory(category, function(output) { 
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
