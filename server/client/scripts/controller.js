var BaseController = function() {
  // An external controller can be mixed in that provides the interaction with the different form factors
    
  var fireEvent = function(name, data) {
    var e = document.createEvent("Event");
    e.initEvent(name, true, true);
    e.data = data;
    window.dispatchEvent(e);
  };

  // URL Events
  var onRootChanged = function(request) {
    gotoRoot();
  };

  var onCategoryChanged = function(request) {
    changeCategory(request.params.category);
  };

  var onArticleChanged = function(request) {
    var data = request.params;
    changeArticle(data.category, data.article);
  };

  // Event triggers
  var gotoRoot = function() {
    window.history.pushState(undefined, "", "/");

    $("html").attr("class", "menuState");
    $(".category").removeClass("active");

    fireEvent("rootchanged", {});
  };

  var changeCategory = function(categoryElement) {
    var category = categoryElement

    window.history.pushState(undefined, "", "/reader/" + category);

    $("html").attr("class", "categoryState");
    $(".category").removeClass("active");
    $("li[data-category='"+ category +"']").addClass("active");
    $("section[data-category='"+ category +"']").addClass("active");
    
    fireEvent("changecategory", {category: category});
  };

  var changeArticle = function(category, article) {
    window.history.pushState(undefined, "", "/reader/" +category + "/" + article );
    $(".category").removeClass("active");
    $("li[data-category='"+ category +"']").addClass("active");
    $("section[data-category='"+ category +"']").addClass("active");
    $("article[data-article='" + article + "']").addClass("active");
    fireEvent("changearticle", {category: category, article: article});
  };

  var activate = function(element) {
    var data = $(element).data();
    
    if(data.article) {
      changeArticle(data.category, data.article);
    }
    else if(data.category) {
      changeCategory(data.category);
    }
    else {
      changeRoot();
    }

  };

  var app = new routes(); 
  app.get("/", onRootChanged);
  app.get("/:category", onCategoryChanged);
  app.get("/:category.html", onCategoryChanged);
  app.get("/:category/:article.html", onArticleChanged);

  return {
    onRootChanged: onRootChanged,
    onCategoryChaged: onCategoryChanged,
    onArticleChanged: onArticleChanged,

    activate: activate
  };
};
