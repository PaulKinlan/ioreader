var PhoneController = function() {

  $("article").eq(3).addClass("active");

  var controller = this;

  var $categories = $(".categories"),
      $nav = $("nav ul"),
      $scrollables = $categories.add($("nav ul"));
      $category = $(".category", $categories),
      categoryIndex = $(".categories .category.active").prev().length,
      pageY = window.pageYOffset;

  function animateToCurrentCategory(callback) {
    unregisterTouch(); // ignore touch during animation
    $scrollables.animate({marginLeft: -categoryIndex*$(window).width()},function() {
      if (callback) callback();
      registerTouch();
    });
  }

  var categoryTouchOpts = {
    swipeX: function(ev) {
      if (categoryIndex==0 && ev.dx > 50) controller.refresh(); // funky pullback gesture
      categoryIndex =
        ev.dx < 0 ? Math.min(categoryIndex+1, $category.length-1)
                  : Math.max(categoryIndex-1, 0);
      animateToCurrentCategory(function() {
          // since an active article will now be hidden, causing layout chaos:
        if ($("article.active").length) $("section.active").css("marginTop", 0);
        controller.activate($category.get(categoryIndex));
      });
    },
    swipeY: function() { // do nothing; we only want move events
    }, 
    moveX: function(ev) {
      $scrollables.css("marginLeft", ev.dx + parseInt($scrollables.css("marginLeft")));
    },
    moveY: function(ev) {
      //var minMarginY = -10+$(window).height()-$(document).height();
      var bodyHeight=Math.max($("body").height(), $(window).height());
      // var minMarginY = $(window).height()-$("body").height();
      var maxHeightAboveWindow = $("section.active").height() + $("nav ul").height() - $(window).height();
      var newMarginTop = parseInt($("section.active").css("marginTop"))+ev.dy
      console.log(maxHeightAboveWindow, newMarginTop);
      $("section.active").css("marginTop", inside(-maxHeightAboveWindow, newMarginTop, 0));
      console.log($("section.active").css("marginTop"));
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
      animateToCurrentCategory(); // ^^ ditto
    }
  };
  var navTouchOpts = $.extend({}, categoryTouchOpts, {
    moveY: function() { console.log("IGNORED"); },
    click: function() {
      controller.activate(this);
      return false;
    }
  });

  $(function() {
    $scrollables.css({marginLeft: -categoryIndex*$(window).width()})
    registerTouch();
    $("nav a").click(function() {
      var categoryID = $(this).parent().data("category");
      console.log($("#"+categoryID, $(".categories")));
      controller.activate($("#"+categoryID, $(".categories")));
      console.log("DONE");
      return false;
    });
    $("nav a,nav a:visited").css("color", "yellow").css("fontWeight", "bold"); // quick hack to verify page loaded ok
  });

  function registerTouch() {
    $categories.touch(categoryTouchOpts);
    $nav.touch(navTouchOpts);
  }

  function unregisterTouch() {
    $categories.touch(null);
    $nav.touch(null);
  }

  function inside(min, val, max) {
    return Math.min(max,Math.max(val,min));
  }

}

PhoneController.prototype = new BaseController();
PhoneController.prototype.constructor = PhoneController;
Controller = new PhoneController();
