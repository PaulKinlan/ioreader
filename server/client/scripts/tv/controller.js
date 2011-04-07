var TvController = function() {
  var controller = this;

  // Hook up click events to activate categories and items
  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });

  // Start with a default category and first article selected
  window.addEventListener('rootchanged', function() {
    // Get the first article 
    var article = $('article');
    var request = {params: 
      {
        category: article.data('category'),
        article: article.data('article'),
      }
    };
    Controller.onArticleChanged(request);
  });
};

TvController.prototype = new BaseController();
TvController.prototype.constructor = TvController;

Controller = new TvController();
