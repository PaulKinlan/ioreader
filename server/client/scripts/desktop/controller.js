// Listen to UI events.
var DesktopController = function() {
  var controller = this;

  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });

  window.addEventListener("categorychanged", function(e) {
    //  Scroll to the category into views
    console.log(e.data);
    var top = $("#" +  e.data.category).offset().top;
    $(".categories").scrollTop(top);
  });
};

DesktopController.prototype = new BaseController();
DesktopController.prototype.constructor = DesktopController;

Controller = new DesktopController();
