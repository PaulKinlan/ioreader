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
  var controller = this;

  var $categories = $(".categories"),
      $nav = $("nav ul"),
      $scrollables = $categories.add($("nav ul"));
      $formfactors = $("#formfactors"),
      categoryIndex = $(".categories .category.active").prev().length,
      pageY = window.pageYOffset;

  function animateToCurrentCategory(animate, callback) {
    if (!animate) {
      return $scrollables.css({marginLeft: -categoryIndex*$(window).width()});
    }
    $formfactors.hide();
    unregisterTouch(); // ignore touch during animation
    $scrollables.animate({marginLeft: -categoryIndex*$(window).width()},function() {
      $formfactors.show();
      registerTouch();
      if (callback) callback();
    });
  }

  var categoryTouchOpts = {
    swipeX: function(ev) {
      var $category = $(".category", $categories);
      // if (categoryIndex==$category.length-1 && ev.dx < 0) return animateToCurrentCategory(true);
      if (categoryIndex==0 && ev.dx>0 ) {
        controller.refresh(); // funky pullback gesture
      }
      if (categoryIndex==$category.length-1 && ev.dx<0 ) {
        controller.refresh(); // funky pullback gesture
      }
      var increment = ev.dx < 0 ? 1 : -1;
      categoryIndex = inside(0, categoryIndex+increment, $category.length-1);
      animateToCurrentCategory(true, function() {
        controller.activate($category.get(categoryIndex));
      });
    },
    swipeY: function() { // do nothing; we only want move events
    }, 
    moveX: function(ev) {
      console.log("moveX "+ev.dx);
      $formfactors.hide();
      $scrollables.css
        ("marginLeft", ev.dx + parseInt($scrollables.css("marginLeft")));
    },
    moveY: function(ev) {
      console.log("moveY "+ev.dy+$("section.active").attr("id"));
      var maxHeightAboveWindow =
        $("section.active").height()+$("nav ul").height()-$(window).height();
      var newMarginTop = parseInt($("section.active").css("marginTop"))+ev.dy
      $("section.active").css("marginTop",
        inside(-maxHeightAboveWindow, newMarginTop, 0));
    },
    click: function(ev) {
      var $target = $(ev.target);
          $article = $target.closest("article");
      animateToCurrentCategory(false);  // revert small movement
      controller.activate($article);
    },
    longHold: function(ev) {
      animateToCurrentCategory(false); // ^^ ditto
    }
  };
  var navTouchOpts = $.extend({}, categoryTouchOpts, {
    moveY: function() { },
    click: function() {
      controller.activate(this);
      return false;
    }
  });

  function onRootChanged() {
    // Select the first category
    controller.activate($("section.category")[0]);
  };

  function onCategoryChanged() {

    var $touchArticle = $(".touchScroll")
      .removeClass("touchScroll")
      .css("position", "static");
    if ($touchArticle.length) {

      // Since TouchScroll library doesn't have a way to untouchscroll, we do it ourselves
      $touchArticle.css("overflow", "hidden"); // revert from fix for desktop
      $touchArticle.touch(null);
      $originalContents = $(".touchScrollInner").children().clone();
      $touchArticle.empty().append($originalContents);;
      $clone = $touchArticle.clone().insertBefore($touchArticle);
      $touchArticle.remove();
    }
    registerTouch();
  }

  function onArticleChanged() {
    unregisterTouch();
    $("section.active").css("marginTop", 0);
    var activeArticle = $("article.active").get(0);
    new TouchScroll(activeArticle, {elastic: false});

    if (! $.touch.isTouchDevice()) activeArticle.style.overflow = "auto"; // todo->stylesheet
  }

  function registerTouch() {
    console.log("registerTouch");
    $categories.touch(categoryTouchOpts);
    $nav.touch(navTouchOpts);
  }

  function unregisterTouch() {
    console.log("unregisterTouch");
    $categories.touch(null);
    $nav.touch(null);
  }

  function inside(min, val, max) {
    return Math.min(max,Math.max(val,min));
  }

  window.addEventListener("rootchanged", onRootChanged, false)
  window.addEventListener("articlechanged", onArticleChanged, false);
  window.addEventListener("categorychanged", onCategoryChanged, false);
  controller.processRoutes();
  
  $(document).ready(function() {

    $("nav a").click(function() {
      var categoryID = $(this).parent().data("category");
      controller.activate
        ($("#"+categoryID, $(".categories")).animate({marginTop: 0}));
      return false;
    });

    (window.onresize = function() {
      $scrollables.css({marginLeft: -categoryIndex*$(window).width()})
    })();
    $("nav a,nav a:visited").css("color", "yellow"); // verify pageload

    // $scrollables.css({marginLeft: -categoryIndex*$(window).width()})
    // window.onresize();
    // window.scrollTo(0,0);
  });

}

PhoneController.prototype = new BaseController();
PhoneController.prototype.constructor = PhoneController;
Controller = new PhoneController();
