var proxies = require('./proxies');
var m = require('mustache');
var fs = require('fs');
var async = require('async');
var exceptions = require('./exceptions');

var Controller = function(configuration) {
  var proxy = proxies.ProxyFactory.create(configuration);  
  
  /*
    Loads the template from the file system.
  */ 
  var loadTemplate = function(file, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    fs.readFile(file,'utf8', function(err, data) {
      if(err) throw err;
      callback(data);
    });
  };


  /*
   * Generates the app cache.
   */
  this.renderAppCache = function(callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException("No Callback");

    // currently only gets the the files in the root
    var getFiles = function (directory, type) {
      return function(fileCallback) {
        fs.readdir(directory, function(err,files) {
          var output = [];
          var file;
          for(var i = 0; file = files[i]; i++) {
            output.push({name: "/" + type + "/" + file});
          } 

          fileCallback(null, {type: type, files: output});
        });
      };
    };

    var fileActions = [];
    fileActions.push(getFiles(configuration.clientDir + "/css", "css"));
    fileActions.push(getFiles(configuration.clientDir + "/scripts", "scripts"));
    fileActions.push(getFiles(configuration.clientDir + "/images", "images"));

    async.parallel(fileActions, function(err, result){
      var now = new Date();
      var data = {files: {}, now: now};
      var folder;

      for(var i = 0; folder = result[i]; i++) {
        data.files[folder.type] = folder.files;
      }
      
      loadTemplate(configuration.baseDir + "app.cache", function(template) {
        callback(m.to_html(template, data));  
      });
    });
  };

  /*
    Fetches and renders the categories for a given format.
  */ 
  this.fetchCategories = function(format, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    proxy.fetchCategories(function(data) {
      if(format == "json") {
        callback(JSON.stringify(data));
      }
      else {
        loadTemplate(configuration.baseDir + "index." + format, function(template) {
          callback(m.to_html(template, {"categories" : data, "configuration": configuration}));
        });
      }
    }); 
  };

  /*
    For a given category fetch and render the list of articles.
  */
  this.fetchCategory = function(id, format, callback) {
    if(!!id == false) throw new exceptions.Exception("Category id not specified");
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    
    proxy.fetchCategory(id, function(data) {
      // Render the data. 
      if(format == "json") {
        callback(JSON.stringify({categories: data}));
      }
      else {
        loadTemplate(configuration.baseDir + "category." + format, function(template) {
          callback(m.to_html(template, {"categories": data, "configuration": configuration})); 
        });
      }
    }); 
  };

  this.fetchArticle = function(id, category, format, callback) {
    if(!!id == false) throw new exceptions.Exception("Article id not specified");
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    proxy.fetchArticle(id, category, function(data) {
      // Render the data. 
      if(format == "json") {
        callback(JSON.stringify({categories: data}));
      }
      else {
        loadTemplate(configuration.baseDir + "article." + format, function(template) {
          callback(m.to_html(template, {"categories": data, "configuration": configuration})); 
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

exports.Controller = Controller;
