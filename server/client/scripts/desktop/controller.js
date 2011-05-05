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

// Listen to UI events.
var DesktopController = function() {
  var controller = this;
  var articleOffset = 0;
  var categoryOffset = 0;
  var refreshInterval = 3 * 60000; // 3 Minutes

  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });

  var refreshData = function() {
    controller.refresh();
  };

  window.setInterval(refreshData, refreshInterval);

  window.addEventListener('categorychanged', function(e) {
    var category = $("#" + e.data.category);
    var categories = $(".categories");
    var categoryH2 = $("h2", category);
    
    categories.css("marginLeft", (categories.offset().left - category.offset().left) + categoryH2.height() + 160);
  });

  window.addEventListener('load', function(e) {
    // Switch out low-res thumbnails for hi-res with fade in effect.
    $('article > header > img.thumbnail[data-src-hi]').each(function(i, el) {
      var $el = $(this);

      var srcHi = $el.data('src-hi');
      if (srcHi) {
        var img = new Image();
        img.onload = function(e) {
          var clone = el.cloneNode(true);
          var $clone = $(clone);
          clone.src = this.src;
          $clone.addClass('hi-res');
          el.insertAdjacentElement('beforeBegin', clone);
          $clone.addClass('fadein');

          var transEnd = function(e) {
            this.addEventListener('webkitTransitionEnd', transEnd, false);
            $el.remove();
            this.style.position = 'static';
          };
          clone.addEventListener('webkitTransitionEnd', transEnd, false);
        };
        img.src = srcHi;
      }
    });
  });

  window.addEventListener("keyup", function(e) {
    var newControl;
    var currentCategory = controller.getActiveCategory();
    var currentArticle = controller.getActiveArticle();
    e.preventDefault();
    switch(e.keyCode) {
      case 37://left
        newControl = currentCategory.prev();
        if(newControl.length == 0) newControl = $("section.category").last();
        $(".articles", currentCategory).scrollTop(0);
        break;
      case 38://up
        newControl = currentArticle.prev();
        if(newControl.length == 0) newControl = $("section.active article").last(); 
        $(".articles", currentCategory).scrollTop(newControl[0].offsetTop);
        break;  
      case 39://right
        newControl = currentCategory.next();
        if(newControl.length == 0) newControl = $("section.category").first();
        $(".articles", currentCategory).scrollTop(0);
        break;
      case 40://down
        newControl = currentArticle.next();
        if(newControl.length == 0) newControl = $("section.active article").first(); 
        $(".articles", currentCategory).scrollTop(newControl[0].offsetTop);
        break;
    } 
    
    controller.activate(newControl);
    return false;
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
