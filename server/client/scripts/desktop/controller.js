// Listen to UI events.
var DesktopController = function() {
  var controller = this;

  // Respond to UI events
  var rootClicked = function(e) {
    controller.gotoRoot();
  };

  var categoryClicked = function(e) {
    var category = $(e.currentTarget).data().category;
    controller.changeCategory(category);
    e.preventDefault();
    return false;
  };

  var articleClicked = function(e) {
    var category = $(e.currentTarget).data().category;
    var article = $(e.currentTarget).data().article;
    controller.changeArticle(category, article);
    e.preventDefault();
    return false;
  };


  // Respond to Application events
  /*
   * The Category has changed, update the UI if needed in a desktop specific way
   */
  var onCategoryChanged = function(data) {

  };

  /*
   *  An article has been selected or changed, update the UI in a desktop specific way
   */
  var onArticleChanged = function(category, article) {

  };

  /*
   * Handle the event when the app goes to the "root" state.
   */
  var onRoot = function() {
   
  };

  $(".categories").live("click", rootClicked);
  $(".category").live("click", categoryClicked);
  $("article").live("click", articleClicked);

  window.addEventListener("rootchanged", onRoot);
  window.addEventListener("categoryrchanged", onCategoryChanged);
  window.addEventListener("artcilechanged", onArticleChanged);
};

DesktopController.prototype = new BaseController();
DesktopController.prototype.constructor = DesktopController;

Controller = new DesktopController();
