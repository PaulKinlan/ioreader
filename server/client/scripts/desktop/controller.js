// Listen to UI events.
var DesktopController = function() {
  var controller = this;

  var rootClicked = funtion() {
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

  $(".categories").live("click", gotoRoot);
  $(".category").live("click", categoryClicked);
  $("article").live("click", articleClicked);
};

DesktopController.prototype = new Controller();
DesktopController.prototype.constructor = DesktopController;

Controller = new DesktopController();
