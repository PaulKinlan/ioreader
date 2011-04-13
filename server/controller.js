var proxies = require('./proxies');
var m = require('mustache');
var fs = require('fs');
var async = require('async');
var exceptions = require('./exceptions');

var Controller = function(configuration) {
  var proxy = proxies.ProxyFactory.create(configuration);  
  var globalTemplates = [
    {type: "index", file: configuration.baseDir + "index.html"},
    {type: "category", file: configuration.baseDir + "category.html"},
    {type: "article", file: configuration.baseDir + "article.html"},
  ];

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
   * Asynchronously load a list of templates. { file: "test.tmpl", type: "index" }
   * Loaded in the order of specification
   */
  var loadTemplates = function(templates, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    
    var getTemplate = function (template) {
      return function(templateCallback) {
        loadTemplate(template.file, function(data) {
          templateCallback(null, { type: template.type, template: data })
        }); 
      };
    };

    var templateActions = templates.map(function(i) { return getTemplate(i); });
    console.log(templateActions);
    async.parallel(templateActions, function(err, result){
      var output = {};
      result.forEach(function(item) { output[item.type] = item.template; });
    
      callback(output); 
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
        fs.readdir(configuration.clientDir + directory, function(err, files) {
          if(!!files == false) {
            files = [];
          }
          var output = [];
          var file;
          
          for(var i = 0; file = files[i]; i++) {
            // ignore folders
            if(file.indexOf(".") <= 0) continue;
            output.push({name: directory + "/" + file});
          } 

          fileCallback(null, {type: type, files: output});
        });
      };
    };

    var fileActions = [];
    fileActions.push(getFiles("lib", "scripts"));
    fileActions.push(getFiles("css", "css"));
    fileActions.push(getFiles("css/desktop", "css"));
    fileActions.push(getFiles("css/tv", "css"));
    fileActions.push(getFiles("css/tablet", "css"));
    fileActions.push(getFiles("css/phone", "css"));
    fileActions.push(getFiles("scripts", "scripts"));
    fileActions.push(getFiles("scripts/phone", "scripts"));
    fileActions.push(getFiles("scripts/tv", "scripts"));
    fileActions.push(getFiles("scripts/tablet", "scripts"));
    fileActions.push(getFiles("scripts/desktop", "scripts"));
    fileActions.push(getFiles("images", "images"));

    async.parallel(fileActions, function(err, result){
      var now = new Date();
      var data = {files: {}, now: now, version: configuration.version};
      var folder;

      for(var i = 0; folder = result[i]; i++) {
        if(!!data.files[folder.type] == false) data.files[folder.type] = [];
        var files = folder.files;
        var file;
        // Join files of types together 
        for(var f = 0; file = files[f]; f++) {
          data.files[folder.type].push(file);
        }
      }

      loadTemplate(configuration.baseDir + "app.cache", function(template) {
        callback(m.to_html(template, {"categories" : data, "configuration": configuration}));
      });
    });
  };

  var renderTemplate = function (data, format, callback) {
    if(format == "json") {
      callback(JSON.stringify(data));
    }
    else {
      loadTemplates(globalTemplates, function(template) {
        console.log(data);
        callback(m.to_html(template.index, {"categories" : data, "configuration": configuration}, template));
      });
    }
  };

  /*
    Fetches and renders the categories for a given format.
  */ 
  this.fetchCategories = function(format, callback) {
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    proxy.fetchCategories(function(data) {
      renderTemplate(data, format, callback); 
    }); 
  };

  /*
    For a given category fetch and render the list of articles.
  */
  this.fetchCategory = function(id, format, callback) {
    if(!!id == false) throw new exceptions.Exception("Category id not specified");
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    
    proxy.fetchCategory(id, function(data) {
      renderTemplate(data, format, callback); 
    }); 
  };

  this.fetchArticle = function(id, category, format, callback) {
    if(!!id == false) throw new exceptions.Exception("Article id not specified");
    if(!!callback == false) throw new exceptions.NoCallbackException("No callback");
    proxy.fetchArticle(id, category, function(data) {
      renderTemplate(data, format, callback); 
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
