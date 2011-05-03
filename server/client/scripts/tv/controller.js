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

var TvController = function() {
  var controller = this;

  // Hook up click events to activate categories and items
  $(".categories, .category, article").live("click", function(e) {
    controller.activate(e.currentTarget);

    e.preventDefault();
    return false;
  });

  // Start with a default category and first article selected
  window.addEventListener('rootchanged', function() {
    // Get the first article 
    var article = $('article');
    var request = {params: 
      {
        category: article.data('category'),
        article: article.data('article')
      }
    };
    Controller.onArticleChanged(request);
  });

  // Ensure article in the list of articles is visible
  window.addEventListener('articlechanged', function() {
    var article = Controller.getActiveArticle();
    scrollLeft = Math.abs(parseInt($('.articles').css('margin-left'), 10));
    screenLeft = article.position().left;
    console.log('screenLeft: ' + screenLeft);
    windowWidth = $(window).width();
    //articleWidth = $('article').width();
    articleWidth = 200;

    if (screenLeft > windowWidth - articleWidth) {
      // We hit the right side of the div
      // Set negative margin-left on the active article listing
      $('.articles').css('margin-left', -(scrollLeft + windowWidth - screenLeft
                                          + articleWidth) + 'px');
    } else if (screenLeft < 0) {
      // We hit the left side of the div
      // Set margin-left to be less negative
      var newScrollLeft = Math.min(0, -(scrollLeft + screenLeft));
      $('.articles').css('margin-left', newScrollLeft + 'px');
    }
  });

  var isFull = function(value) {
    var body = $(document.body);
    if (value === undefined) {
      // Returns true if the navigation is invisible
      return body.hasClass('full');
    }
    // Now value is true or false
    if (value) {
      body.addClass('full');
    } else {
      body.removeClass('full');
    }
  };

  var KEY = {
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Ok: 13
  }

  var SCROLL_INCREMENT = 40;

  // Bind to the keydown event
  window.addEventListener('keydown', function(event) {
    var newControl;
    var theArticle = Controller.getActiveArticle();
    var theCategory = Controller.getActiveCategory();
    var key = event.keyCode;

    // If in full screen view, 
    if (isFull()) {
      // Left, right and OK bring up menu
      if (key == KEY.Left || key == KEY.Right || key == KEY.Ok) {
        event.preventDefault();
        isFull(false);
      }
      // Up and down scroll
      if (key == KEY.Up || key == KEY.Down) {
        var $sec = $('article.active section');
        var scrollTop = $sec.scrollTop();
        var multiplier = (key == KEY.Down) ? 1 : -1;
        $sec.scrollTop(scrollTop + multiplier * SCROLL_INCREMENT);
      }
      return;
    }

    if (key !== KEY.Up) {
      delete controller.lastArticle;
    }

    switch(key) {
      case KEY.Left:
        if (theArticle.length) {
          // Select the previous article
          newControl = theArticle.prev();
        } else if (theCategory.length) {
          // Select the previous category
          newControl = theCategory.prev();
        }
        break;
      case KEY.Up:
        if (theArticle.length) {
          // Hide navigation bar
          isFull(true);
        } else if (theCategory.length) {
          if (controller.lastArticle) { 
            newControl = controller.lastArticle;
          } else {
            // Select the first article in the active section
            newControl = $('section.active article').first();
          }
        }
        break;
      case KEY.Right:
        if (theArticle.length) {
          // Select the next article
          newControl = theArticle.next();
        } else if (theCategory.length) {
          // Select the next category
          newControl = theCategory.next();
        }
        break;
      case KEY.Down:
        if (theArticle.length) {
          // Deselect the category
          newControl = theCategory;
          controller.lastArticle = theArticle;
        }
        break;
      case KEY.Ok:
        // Hide the menu
        if (theArticle.length) {
          isFull(true);
        }
        break;
    }

    if (!!newControl && newControl.length > 0) {
      Controller.activate(newControl);
    }
  });

  // Show placeholders for all thumbnails that didn't load
  $('article > header > img.thumbnail').each(function(i, el) {
    var $el = $(this);
    if (! $el.attr('src')) {
      // Set a no image class on the header
      $el.parent('header').addClass('missing-image');
    }
  });

  // Show placeholders for large images that didn't load
  $('img.large').each(function(i, el) {
    var $el = $(this);
    if (! $el.attr('src')) {
      $el.wrap('<div class="missing-image"/>');
    }
  });
};

TvController.prototype = new BaseController();
TvController.prototype.constructor = TvController;

Controller = new TvController();
