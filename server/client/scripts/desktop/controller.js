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
    switch(e.keyCode) {
      case 37://left
        newControl = controller.getActiveCategory().prev();
        if(newControl.length == 0) $("section.category").last();
        break;
      case 38://up
        newControl = controller.getActiveArticle().prev();
        if(newControl.length == 0) newControl = $("section.active article").last(); 
        break;  
      case 39://right
        newControl = controller.getActiveCategory().next();
        if(newControl.length == 0) newControl = $("section.category").first();
        break;
      case 40://down
        newControl = controller.getActiveArticle().next();
        if(newControl.length == 0) newControl = $("section.active article").first(); 
        break;
    } 

    if(!!newControl && newControl.length > 0) controller.activate(newControl);
    e.preventDefault();
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
