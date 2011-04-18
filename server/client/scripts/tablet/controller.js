var TabletController = function() {
  var controller = this;

  // Hook up click events to activate categories and items
  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);
    e.preventDefault();
    return false;
  });

  $('body > header > h1').live('click', function(e) {
    window.location = '/'; //TODO(ericbidelman): Figure out how to do this with routes.
  });

  window.addEventListener('load', function(e) {
    // Switch out low-res thumbnails for hi-res with fade in effect.
    $('img.large').each(function(i, el) {
      var $el = $(this);
      if (!$el.attr('src')) {
        var srcLow = $el.data('src-lo');
        if (srcLow) {
          el.src = srcLow;
        } else {
          $el.wrap('<div class="missing-image"/>');
          //el.style.minHeight = '200px';
          //el.style.visibility = 'hidden';
        }
      }
    });

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
      } else if (!$el.attr('src')) {
        el.style.visibility = 'hidden';
        $el.parent('header').addClass('missing-image');
      }
    });

  }, false);

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
console.log('articlechanged', e);
//$('.categories .category.active .articles').touchScroll();
//    $('article.active').touchScroll();
  }, false);

  window.addEventListener("articleready", function(e) {
console.log('articleready', e);

    //$('article.active').touchScroll('update');
    /*var html = $('.category.active article.active').html();
    $('.category.active article.active').html(
      '<iframe style="width:100%;height:100%" src="data:text/html,' + encodeURIComponent(html) + '"></iframe>');*/

  }, false);

  window.addEventListener("categorychanged", function(e) {
console.log(e, e.data.category);
    //var top = $("#" +  e.data.category).offset().top;
    //$(".categories").scrollTop(top);

    controller.activate($('.category.active article'));

  }, false);

};

TabletController.prototype = new BaseController();
TabletController.prototype.constructor = TabletController;

Controller = new TabletController();
