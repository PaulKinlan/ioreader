var TabletController = function() {
  var controller_ = this;
  var scrollers_ = {};

  // Hook up click events to activate categories and items
  $(".categories, .category, article").live('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget !== document.querySelector('article.active')) {
      controller_.activate(e.currentTarget);
    }
    return false;
  });

  $('body > header > h1').live('click', function(e) {
    window.location = '/'; //TODO(ericbidelman): Figure out how to do this with routes.
  });

  window.addEventListener('load', function(e) {

    // Add touch scoller on page load if an article is active.
    var article = document.querySelector('article.active');
    if (article && !(article.id in scrollers_)) {
      scrollers_[article.id] = new TouchScroll(article.querySelector('section'), {elastic: true});
    }

    /*var categories = document.querySelector('.categories');
    if (!('categories' in scrollers_)) {
      scrollers_['categories'] = new TouchScroll(categories, {elastic: true});
    }*/

    // Switch out low-res thumbnails for hi-res with fade in effect.
    $('img.large').each(function(i, el) {
      var $el = $(this);
      if (!$el.attr('src')) {
        var srcLow = $el.data('src-lo');
        if (srcLow) {
          el.src = srcLow;
        } else {
          $el.wrap('<div class="missing-image"/>');
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
    Controller_.onArticleChanged(request);*/
console.log(e)
  });

  window.addEventListener('articlechanged', function(e) {
//console.log('articlechanged', e);

/*  var categories = document.querySelector('.category.active .articles');
  if (!(controller_.getActiveCategory()[0].id in scrollers_)) {
    scrollers_[controller_.getActiveCategory()[0].id] = new TouchScroll(categories, {elastic: true});
  }
  */

    // Cache touch scroller so we don't init it more than once for this el.
    if (!(e.data.article in scrollers_)) {
      //var div = $('article.active section').wrap('<div/>');
      //scrollers_[e.data.article] = $('article.active section').touchScroll();
      scrollers_[e.data.article] = new TouchScroll(document.querySelector('article.active section'), {elastic: true});
    }

  }, false);

  window.addEventListener("articleready", function(e) {
//console.log('articleready', e);

    //$('article.active').touchScroll('update');
    /*var html = $('.category.active article.active').html();
    $('.category.active article.active').html(
      '<iframe style="width:100%;height:100%" src="data:text/html,' + encodeURIComponent(html) + '"></iframe>');*/

//var $scroller = scrollers_[e.data];
//$('article.active .story').height($('article.active .story').height());
//$scroller.height($scroller.attr('scrollHeight'));
//$scroller.touchScroll('update');

  }, false);

  window.addEventListener("categorychanged", function(e) {
//console.log(e, e.data.category);
    //var top = $("#" +  e.data.category).offset().top;
    //$(".categories").scrollTop(top);

    controller_.activate($('.category.active article')); // Activate first article.
  }, false);

};

TabletController.prototype = new BaseController();
TabletController.prototype.constructor = TabletController;

Controller = new TabletController();
