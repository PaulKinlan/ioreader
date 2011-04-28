var BaseController = function() {
  // An external controller can be mixed in that provides the interaction with the different form factors
    
  var fireEvent = function(name, data) {
    var e = document.createEvent("Event");
    e.initEvent(name, true, true);
    e.data = data;
    window.dispatchEvent(e);
  };

  // URL Events
  var onRootURLChanged = function(request) {
    gotoRoot();
  };

  var onCategoryURLChanged = function(request) {
    changeCategory(request.params.category);
  };

  var onArticleURLChanged = function(request) {
    var data = request.params;
    changeArticle(data.category, data.article);
  };

  // Event triggers
  var gotoRoot = function() {
    $("html").addClass("menuState");
    $(".category").removeClass("active");
    $("article").removeClass("active");
    fireEvent("rootchanged", {});
  };

  var changeCategory = function(categoryElement) {
    var category = categoryElement

    $("html").addClass("categoryState");
    $(".category").removeClass("active");
    $("article").removeClass("active");
    $("li[data-category='"+ category +"']").addClass("active");
    $("section[data-category='"+ category +"']").addClass("active");
    
    fireEvent("categorychanged", {category: category});
  };

  var changeArticle = function(category, article) {

    $("html").addClass("articleState");
    $(".category").removeClass("active");
    $("article").removeClass("active");
    $("li[data-category='"+ category +"']").addClass("active");
    $("section[data-category='"+ category +"']").addClass("active");
    $("article[data-article='" + article + "']").addClass("active");

    fireEvent("articlechanged", {category: category, article: article});
  };

  var fetchArticle = function(category, article, callback) { 
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        var article = JSON.parse(xhr.responseText);
        callback(article);
        fireEvent("articleready", article); 
      }
    };
    xhr.open("GET", "/reader/" + category + "/" + article + ".json");
    xhr.send();
  };

  var fetchCategory = function(category, callback) { 
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        var article = JSON.parse(xhr.responseText);
        callback(article);
        fireEvent("categoryready", article); 
      }
    };
    xhr.open("GET", "/reader/" + category + ".json");
    xhr.send();
  };
  
  var fetchAll = function(callback) { 
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        var article = JSON.parse(xhr.responseText);
        callback(article);
        fireEvent("allready", article); 
      }
    };
    xhr.open("GET", "/index.json");
    xhr.send();
  };

  var activeElement;

  var getActiveCategory = function() {
    return $("section.category.active");
  };

  var getActiveArticle = function() {
    return $("article.active");
  };

  var activate = function(element) {
    if(!!element == false) {
      
      if (window.history.pushState) {
        window.history.pushState(undefined, "", "/");
      }
      
      gotoRoot();
      return;
    }

    activeElement = $(element);

    var data = activeElement.data();
    
    if(data.article) {
      if (window.history.pushState) {
        window.history.pushState(undefined, "", "/reader/" + data.category + "/" + data.article );
      }
      changeArticle(data.category, data.article);
      console.log("loading article");
      $("html").addClass("loadingArticle");
      fetchArticle(data.category, data.article, function(result) {
        var categories = result.categories;
        var category;
        for(var i = 0; category = categories[i]; i++) {
          var articles = category.articles;
          var article;
          if(articles.length >0) {
            for(var a = 0; article = articles[a]; a++) {
              if(article.articleState == "active") {
                $(".story", element).html(article.body);
                $("html").removeClass("loadingArticle");
                return;
              }
            }
          }
        }
      });
    }
    else if(data.category) {
      if (window.history.pushState) {
        window.history.pushState(undefined, "", "/reader/" + data.category );
      }

      changeCategory(data.category);
    }
    else {
      if (window.history.pushState) {
        window.history.pushState(undefined, "", "/reader/" + data.category + "/" + data.article );
      }

      gotoRoot();
    }
  };

  var templates = {
    article: "{{#articles}} <article id=\"{{id}}\" data-article=\"{{id}}\" data-category=\"{{categoryId}}\"> <header> <h1><a href=\"/reader/{{id}}\">{{title}}</a></h1> <p><time pubdate time=\"{{puddate}}\"></time></p> <img class=\"thumbnail\" src=\"{{thumbnail}}\" src-hi=\"{{largeImage}}\" /> <div class=\"summary\">{{{shortDescription}}}</div> </header> <section> <h1>{{title}}</h1> <p><time pubdate time=\"{{puddate}}\"></time></p> <div class=\"summary\">{{{shortDescription}}}</div><img class=\"large\" src=\"{{largeImage}}\" src-lo=\"{{thumbnail}}\" /> <div class=\"story\"></div> </section> <footer> <a href=\"{{url}}\">Link</a> </footer> </article> {{/articles}}",
    category: "{{#categories}}<section class=\"category {{cateogoryState}}\" data-category=\"{{id}}\" id=\"{{id}}\"><h2>{{name}}</h2><div class=\"articles\">{{> article }}</div></section>{{/categories}}",
  };

  var refresh = function() {
    $("html").addClass("refreshing");
    fetchAll(function(data) {
      // Find all the columns, check for existing elements, add new ones.
      var categories = data.categories;
      var category;
      for(var i = 0; category = categories[i]; i++) {
        console.log("Looking for category " + category.id);
        var articles = category.articles;
        var article;
        var categoryElement = $("#" + category.id); 
        for(var a = 0; article = articles[a]; a++) {
          var articleElement = $("[data-article='" + article.id + "']", categoryElement);
          if(articleElement.length == 0) {
            categoryElement.prepend(Mustache.to_html(templates.article, article));
          }
        }
      }
      $("html").removeClass("refreshing");
    });
  };

  var app = new routes(); 
  app.get("^/", onRootURLChanged);
  app.get("^/reader/:category", onCategoryURLChanged);
  app.get("^/reader/:category.html", onCategoryURLChanged);
  app.get("^/reader/:category/:article", onArticleURLChanged);

  return {
    onRootChanged: onRootURLChanged,
    onCategoryChanged: onCategoryURLChanged,
    onArticleChanged: onArticleURLChanged,
    activate: activate,
    refresh: refresh,
    getActiveArticle: getActiveArticle,
    getActiveCategory: getActiveCategory
  };
};
