var TabletController = function() {
  var controller = this;

  // Hook up click events to activate categories and items
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
            this.style.position = 'relative';
          };
          clone.addEventListener('webkitTransitionEnd', transEnd, false);
        };
        img.src = srcHi;
      }
    });
  });

  // Start with a default category and first article selected
  window.addEventListener('rootchanged', function(e) {
   /* // Get the first article.
    var article = $('article');
    var request = {
      params: {
        category: article.data('category'),
        article: article.data('article'),
      }
    };
    Controller.onArticleChanged(request);*/
console.log(e)
  });

  window.addEventListener('articlechanged', function(e) {

  });

  window.addEventListener("articleready", function(e) {
    
  });

  window.addEventListener("categorychanged", function(e) {
    console.log(e.data.category)
  });

};

TabletController.prototype = new BaseController();
TabletController.prototype.constructor = TabletController;

Controller = new TabletController();
