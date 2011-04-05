!function($) {

  console.log("defining swipe");

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
