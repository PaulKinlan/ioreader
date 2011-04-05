// Listen to UI events.
var DesktopController = function() {
  var controller = this;

  var rootClicked = function() {
    controller.gotoRoot();
  };

  var categoryClicked = function(e) {
    var category = "";
    controller.changeCategory(category);
  };

  var articleClicked = function(e) {
    var category = "";
    var article = "";
    controller.changeArticle(category, article);
  };

  $(".categories").live("click", rootClicked);
  $(".category").live("click", categoryClicked);
  $("article").live("click", articleClicked);
};

DesktopController.prototype = new BaseController();
DesktopController.prototype.constructor = DesktopController;

Controller = new DesktopController();
