!function($) {

  var mouseDownEvent = mouseMoveEvent = null;
  var touch = isTouchDevice();

  $.fn.swipe = function(swipeend, options) {

    // might genericise this - no jQuery requirement
    var opts = $.extend({}, $.fn.swipe.defaults, options);
    var el = $(this).get(0);

    function enhance(ev,epochEvent) {
      // touches[] is null for touchend and mouseMoveEvent *may* be null if a simple click
      ev.x = touch ? (ev.touches && ev.touches[0] ? ev.touches[0].pageX : ((mouseMoveEvent||mouseDownEvent)["x"])) : ev.clientX;
      ev.y = touch ? (ev.touches && ev.touches[0] ? ev.touches[0].pageY : ((mouseMoveEvent||mouseDownEvent)["y"])) : ev.clientY;
      if (!epochEvent) return ev;
      ev.dx = ev.x - epochEvent.x;
      ev.dy = ev.y - epochEvent.y;
      switch(opts.direction) {
        case "x": ev.distance = Math.abs(ev.dx); break;
        case "y": ev.distance = Math.abs(ev.dy); break;
        default: ev.distance = Math.sqrt(ev.dx*ev.dx + ev.dy*ev.dy);
      }
      return ev;
    }

    el[touch ? "ontouchstart" : "onmousedown"] = function(ev) { 
      mouseDownEvent = enhance(ev);
      return false;
    };

    el[touch ? "ontouchmove" : "onmousemove"] = function(ev) {
      if (!mouseDownEvent) return; // we're only interested in diffs
      mouseMoveEvent = enhance(ev,mouseMoveEvent||mouseDownEvent);
      if (opts.move) opts.move(ev);
    };

    el[touch ? "ontouchend" : "onmouseup"] = function(ev) { 
      ev.x = touch ? mouseMoveEvent.x : mouseDownEvent.x;
      ev.y = touch ? mouseMoveEvent.y : mouseDownEvent.y;
      log("mu", ev.x, ev.y);
      enhance(ev,mouseDownEvent);
      if (ev.distance > opts.threshold) swipeend(ev);
      else if (opts.small) opts.small(ev);
      mouseDownEvent = mouseMoveEvent = null;
      return false;
    };

  };

  $.fn.swipe.defaults = {
    move: null,
    small: null,
    direction: "any",
    threshold: 20
  };

  function isTouchDevice() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  }

}(jQuery);

function log() { // combine into one string for android logcat
  var s="";
  for (var i=0; i<arguments.length; i++) {
    s+=arguments[i] + ",";
  }
  console.log(s);
}
