/*   
   Copyright 2011 Google Inc

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

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
      // don't refresh story at the end if we pull to the end
      if (categoryIndex==$category.length-1 && ev.dx < 0) return animateToCurrentCategory();
      if (categoryIndex==0 && ev.dx > 0 ) {
        if (ev.dx<=50) return animateToCurrentCategory();
        else controller.refresh(); // funky pullback gesture
      }
      var increment = ev.dx < 0 ? 1 : -1;
      console.log("CAT I", categoryIndex,increment);
      categoryIndex = inside(0, categoryIndex+increment, $category.length-1);
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
      controller.activate($("#"+categoryID, $(".categories")).animate({marginTop: 0}));
      return false;
    });

    var articleHeight = $("article[class!=active]").outerHeight();
    window.addEventListener("articlechanged", function(e) {
      var $article = $("article.active");
      $article.closest(".category").animate({marginTop: -$article.prevAll().length * articleHeight});
    });

    window.onresize = function() {
      $scrollables.css({marginLeft: -categoryIndex*$(window).width()})
    }

    window.scrollTo(0,0);

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
