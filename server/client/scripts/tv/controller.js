var TvController = function() {
  var controller = this;

  $(".categories, .category, article").live("click", function(e) {
    console.log('clicked');
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });
};

TvController.prototype = new BaseController();
TvController.prototype.constructor = TvController;

Controller = new TvController();
