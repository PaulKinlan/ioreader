var PhoneController = function() {

  $("article").eq(3).addClass("active");

  var controller = this;

  var $categories = $(".categories"),
      $category = $(".category", $categories),
      categoryIndex = $(".category.active").prev().length,
      pageY = window.pageYOffset;

  function animateToCurrentCategory(callback) {
    $(".categories").
      touch(null)
      .animate({marginLeft: -categoryIndex*$(window).width()},function() {
        if (callback) callback();
        $(".categories").touch(touchOpts);
      });
  }

  var touchOpts = {
    swipeX: function(ev) {
      if (categoryIndex==0 && ev.dx > 50) controller.refresh();
      categoryIndex = 
        ev.dx < 0 ? Math.min(categoryIndex+1, $category.length-1)
                  : Math.max(categoryIndex-1, 0);
      animateToCurrentCategory(function() {
        controller.activate($category.get(categoryIndex));
      });
      // $(".category").removeClass("active");
      // $(".categories").eq(categoryIndex).addClass("active");
    },
    swipeY: function() { // do nothing; we only want move events
    }, 
    moveX: function(ev) {
      $(".categories").css("marginLeft", ev.dx + parseInt($(".categories").css("marginLeft")));
    },
    moveY: function(ev) {
      //var minMarginY = -10+$(window).height()-$(document).height();
      var bodyHeight=Math.max($("body").height(), $(window).height());
      var minMarginY = $(window).height()-$("body").height();
      console.log("minMa", minMarginY, "bh", $("body").height());
      $("body").css("marginTop", inside(minMarginY,parseInt($("body").css("marginTop"))+ev.dy, 0));
    },
    click: function(ev) {
      var $target = $(ev.target);
          $header = $target.closest("header"), $article = $target.closest("article"), $story = $target.closest(".story");
      console.log("hD", $header, "XARTICLE", $article);
      if ($story.length) return;

      // if ($header.length && $article.hasClass("active")) {

      // TOGGLE NOT FULLY WORKING - SOME ARTICLES NO LONGER BEING ACTIVATED

      if ($article.length) { 
        if ($article.hasClass("active") && !$target.is(".story")) {
          console.log("TOGGLE OFF", $target);
          controller.activate($category.eq(categoryIndex)); // toggle active article off
        } else {
          controller.activate($article);
          console.log("TOGGLE ON", $target, $article);
        }
      }
      animateToCurrentCategory(); // revert any small movement
    },
    longHold: function(ev) {
      animateToCurrentCategory();
    }
  };

  $(function() {

    $(".categories")
      .css({marginLeft: -categoryIndex*$(window).width()})
      .touch(touchOpts);

    window.addEventListener("articlechanged", function(e) {
      // $(".story").hide();
    });

    $("header h1").css("color", "purple").css("fontWeight", "bold"); // quick hack to verify page loaded ok


  });

  function inside(min, val, max) {
    return Math.min(max,Math.max(val,min));
  } 

}

PhoneController.prototype = new BaseController();
PhoneController.prototype.constructor = PhoneController;
Controller = new PhoneController();
