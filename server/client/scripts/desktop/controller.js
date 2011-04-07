// Listen to UI events.
var DesktopController = function() {
  var controller = this;
  var articleOffset = 0;
  var categoryOffset = 0;

  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });

  window.addEventListener("keyup", function(e) {
    var newControl;
    switch(e.keyCode) {
      case 37://left
        newControl = controller.getActiveCategory().prev();
        break;
      case 38://up
        newControl = controller.getActiveArticle().prev();
        break;  
      case 39://right
        newControl = controller.getActiveCategory().next();
        break;
      case 40://down
        newControl = controller.getActiveArticle().next();
        break;
    } 

    if(!!newControl && newControl.length > 0) controller.activate(newControl);
  });

  window.addEventListener("categorychanged", function(e) {
    //  Scroll to the category into views
    var top = $("#" +  e.data.category).offset().top;
    $(".categories").scrollTop(top);
  });
};

DesktopController.prototype = new BaseController();
DesktopController.prototype.constructor = DesktopController;

Controller = new DesktopController();
