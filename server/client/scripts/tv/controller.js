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
        article: article.data('article'),
      }
    };
    Controller.onArticleChanged(request);
  });

  // Ensure article in the list of articles is visible
  window.addEventListener('articlechanged', function() {
    var article = Controller.getActiveArticle();
    scrollLeft = Math.abs(parseInt($('.articles').css('margin-left')));
    screenLeft = article.position().left;
    console.log('screenLeft: ' + screenLeft);
    windowWidth = $(window).width();
    articleWidth = $('article').width();

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

  // Bind to the keydown event
  window.addEventListener('keydown', function(event) {
    var newControl;
    var theArticle = Controller.getActiveArticle();
    var theCategory = Controller.getActiveCategory();

    // If in full screen view, any key should bring back nav
    if (37 <= event.keyCode && event.keyCode <= 40 && isFull()) {
      event.preventDefault();
      isFull(false);
      return;
    }

    if (event.keyCode !== 38) {
      delete controller.lastArticle;
    }

    switch(event.keyCode) {
      case 37: // left
        if (theArticle.length) {
          // Select the previous article
          newControl = theArticle.prev();
        } else if (theCategory.length) {
          // Select the previous category
          newControl = theCategory.prev();
        }
        break;
      case 38: // up
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
      case 39: // right
        if (theArticle.length) {
          // Select the next article
          newControl = theArticle.next();
        } else if (theCategory.length) {
          // Select the next category
          newControl = theCategory.next();
        }
        break;
      case 40: // down
        if (theArticle.length) {
          // Deselect the category
          newControl = theCategory;
          controller.lastArticle = theArticle;
        }
        break;
    }

    if (!!newControl && newControl.length > 0) {
      Controller.activate(newControl);
    }
  });
};

TvController.prototype = new BaseController();
TvController.prototype.constructor = TvController;

Controller = new TvController();
