// Listen to UI events.
var DesktopController = function() {
  var controller = this;

  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });
};

DesktopController.prototype = new BaseController();
DesktopController.prototype.constructor = DesktopController;

Controller = new DesktopController();
