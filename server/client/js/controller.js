var Controller = (function() {
  // An external controller can be mixed in that provides the interaction with the different form factors
  var externalController;
    
  var fireEvent = function(name, data) {
    var e = document.createEvent("Event");
    e.initEvent(name, true, true);
    e.data = data;
    window.dispatchEvent(e);
  };

  var applyController = function(controller) {
    externalController = controller;
  };
   
  var onRootChanged = function(request) {
    fireEvent("rootchanged", {});
  };

  var onCategoryChanged = function(request) {
    fireEvent("categorychanged", {category: request.params.category});
  };

  var onArticleChanged = function(request) {
    var data = request.params;
    fireEvent("articlechanged", {category: data.category, article: data.article});
  };

  var changeCategory = function(category) {
    fireEvent("changecategory", {category: category});
  };

  var changeArticle = function(category, article) {
    fireEvent("changearticle", {category: category, article: article});
  };

  var app = new routes(); 
  app.get("/", onRootChanged);
  app.get("/:category", onCategoryChanged);
  app.get("/:category.html", onCategoryChanged);
  app.get("/:category/:article.html", onArticleChanged);

  return {
    applyController: applyController,

    onRootChanged: onRootChanged,
    onCategoryChaged: onCategoryChanged,
    onArticleChanged: onArticleChanged,

    // 
    changeArticle: changeArticle,
    changeCategory: changeCategory

  };
})();
