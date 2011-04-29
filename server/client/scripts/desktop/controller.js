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
        if(newControl.length == 0) $("section.category").last();
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
