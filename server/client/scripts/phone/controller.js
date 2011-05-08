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
      $formfactors = $("#formfactors"),
      categoryIndex = $(".categories .category.active").prev().length,
      pageY = window.pageYOffset;

  function animateToCurrentCategory(callback) {
    console.log("anim");
    unregisterTouch(); // ignore touch during animation
    $scrollables.animate({marginLeft: -categoryIndex*$(window).width()},function() {
      console.log("anim reg touch");
      registerTouch();
      if (callback) callback();
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
      categoryIndex = inside(0, categoryIndex+increment, $category.length-1);
      animateToCurrentCategory(function() {
        $formfactors.show();
        controller.activate($category.get(categoryIndex));
      });
    },
    swipeY: function() { // do nothing; we only want move events
    }, 
    moveX: function(ev) {
      $formfactors.hide();
      $scrollables.css
        ("marginLeft", ev.dx + parseInt($scrollables.css("marginLeft")));
    },
    moveY: function(ev) {
      var maxHeightAboveWindow =
        $("section.active").height()+$("nav ul").height()-$(window).height();
      var newMarginTop = parseInt($("section.active").css("marginTop"))+ev.dy
      console.log("moveY", ev.dy, maxHeightAboveWindow, newMarginTop);
      $("section.active").css("marginTop",
        inside(-maxHeightAboveWindow, newMarginTop, 0));
    },
    click: function(ev) {
      var $target = $(ev.target);
          $header = $target.closest("header"),
          $article = $target.closest("article"),
          $story = $target.closest(".story");
      if ($story.length) return;

      $formfactors.show();
      animateToCurrentCategory(unregisterTouch); // revert small movement
      controller.activate($article);
    },
    longHold: function(ev) {
      animateToCurrentCategory(); // ^^ ditto
    }
  };
  var navTouchOpts = $.extend({}, categoryTouchOpts, {
    moveY: function() { },
    click: function() {
      controller.activate(this);
      return false;
    }
  });

  function onArticleChanged() {
    $("section.active").css("marginTop", 0);
    var activeArticle = $("article.active").get(0);
    new TouchScroll(activeArticle, {elastic: false});
    if (! $.touch.isTouchDevice()) activeArticle.style.overflow = "auto";
  }

  function onCategoryChanged() {
    var $touchArticle = $(".touchScroll")
      .removeClass("touchScroll")
      .css("position", "static");
    console.log("category changed, touch article", $touchArticle);
    if ($touchArticle.length) {
      $originalContents = $(".touchScrollInner").children().clone();
      $article.empty().append($originalContents);;
      console.log("orig contents", $originalContents);
    }
    registerTouch();
  }

  function registerTouch() {
    console.log("register touch");
    $categories.touch(categoryTouchOpts);
    $nav.touch(navTouchOpts);
  }

  function unregisterTouch() {
    console.log("unregister touch");
    $categories.touch(null);
    $nav.touch(null);
  }

  function inside(min, val, max) {
    return Math.min(max,Math.max(val,min));
  }

  $(function() {

    // TODO fix (wont work as there's an active article on init for some reason, even if url is /
    if (document.location.pathname=="/") controller.activate($(".category"));

    window.addEventListener("articlechanged", onArticleChanged);
    window.addEventListener("categorychanged", onCategoryChanged);
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
