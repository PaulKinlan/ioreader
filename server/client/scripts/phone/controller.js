var PhoneController = function() {

  var controller = this;

  $(function() {

    // window.scrollTo(0,1);

    var categoryIndex = $(".category.active").prev().length;
    c=categoryIndex;
    $(".categories").css({marginLeft: -categoryIndex*$(window).width()});
    $(".categories").swipe(function(ev) {
      categoryIndex = 
        ev.dx < 0 ? Math.min(categoryIndex+1, $(".category").length-1)
                  : Math.max(categoryIndex-1, 0);
      $(".categories").animate({marginLeft: -categoryIndex*$(window).width()});
      log("swiped", ev.dx, categoryIndex);
      $(".category").removeClass("active");
      log("ci", categoryIndex);
      $(".categories").eq(categoryIndex).addClass("active");
      // controller.activate($(".categories").get(categoryIndex));
    }, {
      move: function(ev) {
        log("moved", ev.dx);
        $(".categories").css("marginLeft", ev.dx + parseInt($(".categories").css("marginLeft")));
      },
      small: function(ev) {
        log("small");
        $(".categories").animate({marginLeft: -categoryIndex*$(window).width()}, 10);
      },
      direction: "x"
    });

    $("article").css("background", "pink"); // quick hack to verify page loaded ok

    $("[data-link-category=story]").click(function() {
      $(".categories").stop().css({marginLeft: 0});
      // setTimeout(function() { $(".categories").css({marginLeft: 0}); }, 1000);
        // weird race condition - need timeout
    });

  });

}

PhoneController.prototype = new BaseController();
PhoneController.prototype.constructor = PhoneController;
Controller = new PhoneController();
