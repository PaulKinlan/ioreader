var PhoneController = function() {

  console.log("defining phone controller");

  var controller = this;

  var categoryIndex = $(".category.active").prev().length;
  c=categoryIndex;
  $(".categories").css({marginLeft: -categoryIndex*$(window).width()});
  $(".categories").swipe(function(ev) {
    categoryIndex = 
      ev.dx < 0 ? Math.min(categoryIndex+1, $(".category").length-1)
                : Math.max(categoryIndex-1, 0);
    controller.activate($(".categories").get(categoryIndex));
  }, {
    move: function(ev) {
      $(".categories").css("marginLeft", ev.dx + parseInt($(".categories").css("marginLeft")));
    },
    small: function(ev) {
      $(".categories").animate({marginLeft: -categoryIndex*$(window).width()}, 10);
    },
    direction: "x"
  });

  $("[data-link-category=story]").click(function() {
    $(".categories").stop().css({marginLeft: 0});
    // setTimeout(function() { $(".categories").css({marginLeft: 0}); }, 1000);
      // weird race condition - need timeout
  });

}

PhoneController.prototype = new BaseController();
PhoneController.prototype.constructor = PhoneController;
Controller = new PhoneController();
