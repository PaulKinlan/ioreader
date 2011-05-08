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

var TabletController = function() {
  var controller_ = this;
  var scrollers_ = {};

  $(document).ready(function() {
    // Add touch scoller on page load if an article is active.
    var activeArticle = document.querySelector('article.active');
    if (activeArticle && !(activeArticle.id in scrollers_)) {
      scrollers_[activeArticle.id] = new TouchScroll(activeArticle.querySelector('section'), {elastic: true});

      // Adjust story header so it'll show for load on article.
      //$(activeArticle.querySelector('section')).css('top', '57px');
    }

    // Add touch scroller to all categories (home view).
    if (!('categories' in scrollers_) && $('html').hasClass('menuState')) {
      scrollers_['categories'] = new TouchScroll(document.querySelector('.categories'), {elastic: true});
    }

    $('<div class="refresh"/>').insertBefore('body > header > nav').click(function() {
      controller_.refresh();
    });
  });

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

    // Replace missing images with placeholder.
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
      } else if (!$el.attr('src')) {
        $el.parent('header').addClass('missing-image');
      }
    });

  }, false);

  window.addEventListener('rootchanged', function(e) {
   /*// Start with a default category and first article selected.
    var article = $('article');
    var request = {
      params: {
        category: article.data('category'),
        article: article.data('article'),
      }
    };
    Controller_.onArticleChanged(request);*/
  });

  window.addEventListener('articlechanged', function(e) {
    var $articles = $('.category.active .articles');

    var opts = {
      swipeX: function(e) {},
      swipeY: function(e) {},
      moveX: function(e) {},
      moveY: function(e) {
        var $articles = $('.category.active .articles');
        $articles.css('marginTop', e.dy + parseInt($articles.css('marginTop')));
      },
      click: function(e) {
        var $article = $(e.target).closest('article');
        controller_.activate($article);
      }
    };
    $articles.touch(opts);

    // Cache touch scroller so we don't init it more than once for this element.
    if (!(e.data.article in scrollers_)) {
      scrollers_[e.data.article] = new TouchScroll(document.querySelector('article.active section'), {elastic: true});
    }

  }, false);

  window.addEventListener("articleready", function(e) {
    //console.log('articleready', e);
  }, false);

  window.addEventListener("categorychanged", function(e) {
    controller_.activate($('.category.active article')); // Activate 1st article.
  }, false);

};

TabletController.prototype = new BaseController();
TabletController.prototype.constructor = TabletController;

Controller = new TabletController();
