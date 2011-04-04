$(function() {
  var categoryIndex = $(".category.active").prev().length;
  c=categoryIndex;
  $(".categories").css({marginLeft: -categoryIndex*$(window).width()});
  $(".categories").swipe(function(ev) {
    categoryIndex = 
      ev.dx < 0 ? Math.min(categoryIndex+1, $(".category").length-1)
                : Math.max(categoryIndex-1, 0);
    $(".categories").animate({marginLeft: -categoryIndex*$(window).width()}, 300);
  }, {
    move: function(ev) {
      $(".categories").css("marginLeft", ev.dx + parseInt($(".categories").css("marginLeft")));
    },
    small: function(ev) {
      $(".categories").animate({marginLeft: -categoryIndex*$(window).width()}, 10);
    },
    direction: "x"
  });


  $("[data-link-category=story]").click(function() {
    $(".categories").stop().css({marginLeft: 0});
    // setTimeout(function() { $(".categories").css({marginLeft: 0}); }, 1000);
      // weird race condition - need timeout
  });

});

!function($) {

  $.fn.swipe = function(swipeend, options) {

    var mouseDownEvent = null;
    var mouseMoveEvent = null;
    var opts = $.extend({}, $.fn.swipe.defaults, options);

    function enhanceEvent(ev,epochEvent) {
      ev.dx = ev.clientX - epochEvent.clientX;
      ev.dy = ev.clientY - epochEvent.clientY;
      switch(opts.direction) {
        case "x": ev.distance = Math.abs(ev.dx); break;
        case "y": ev.distance = Math.abs(ev.dy); break;
        default: ev.distance = Math.sqrt(ev.dx*ev.dx + ev.dy*ev.dy);
      }
    }

    $(this).mousedown(function(ev) {
      mouseDownEvent = ev;
      console.log("ev", ev.clientX,ev.clientY);
    });

    $(this).mouseout(function(ev) {
      if (mouseDownEvent) {
        enhanceEvent(ev,mouseDownEvent);
        if (ev.distance > opts.threshold) swipeend(ev);
        mouseDownEvent = null;
        mouseMoveEvent = null;
      }
    });

    $(this).mouseup(function(ev) {
      enhanceEvent(ev,mouseDownEvent);
      if (ev.distance > opts.threshold) swipeend(ev);
      else if (opts.small) opts.small(ev);
      mouseDownEvent = null;
      mouseMoveEvent = null;
    });

    $(this).mousemove(function(ev) {
      if (!mouseDownEvent) return;
      var lastEvent = mouseMoveEvent || mouseDownEvent;
      console.log("old", lastEvent.clientX, lastEvent.clientY, ev.clientX,ev.clientY);
      enhanceEvent(ev,lastEvent);
      mouseMoveEvent = ev;
      if (opts.move) opts.move(ev);
    });

  };

  $.fn.swipe.defaults = {
    move: null,
    small: null,
    direction: "any",
    threshold: 100
  };

}(jQuery);
