!function($) {

  var startTime,
      direction = mouseDownEvent = mouseMoveEvent = null,
      touch = isTouchDevice();

  $.fn.touch = function(options) {

    // might genericise this - no jQuery requirement
    var opts = $.extend({}, $.fn.touch.defaults, options);
    var el = $(this).get(0);
    if (opts == null) return untouch(el);

    function enhance(ev,epochEvent) {
      // touches[] is null for touchend and mouseMoveEvent *may* be null if a simple click
      ev.x = touch ? (ev.touches && ev.touches[0] ? ev.touches[0].pageX : ((mouseMoveEvent||mouseDownEvent)["x"])) : ev.clientX;
      ev.y = touch ? (ev.touches && ev.touches[0] ? ev.touches[0].pageY : ((mouseMoveEvent||mouseDownEvent)["y"])) : ev.clientY;
      if (!epochEvent) return ev;
      ev.dx = ev.x - epochEvent.x;
      ev.dy = ev.y - epochEvent.y;
      return ev;
    }

    el[touch ? "ontouchstart" : "onmousedown"] = function(ev) {
      mouseDownEvent = enhance(ev);
      startTime = new Date;
      return false;
    };

    // TODO support only one of moveX or moveY. And also, just "move".
    el[touch ? "ontouchmove" : "onmousemove"] = function(ev) {
      if (!mouseDownEvent) return; // we're only interested in diffs
      if (!mouseMoveEvent) {
        ev = enhance(ev,mouseDownEvent);
        console.log(ev.dx, ev.dy, opts.minMove);
        if (abs(ev.dx) >= abs(ev.dy) && abs(ev.dx) > opts.minMove) {
          mouseMoveEvent = ev;
          direction = "x";
        } else if (abs(ev.dy) > abs(ev.dx) && abs(ev.dy) > opts.minMove) {
          mouseMoveEvent = ev;
          mouseMoveEvent = ev;
          direction = "y";
        } else {
          return; // not significant enough
        } // finish checking for first mouse event
      } else {
        mouseMoveEvent = enhance(ev,mouseMoveEvent);
      }

      log("dir", direction, "md", ev);
      direction=="x" ? opts.moveX(ev) : opts.moveY(ev);
      return false;

    };

    el[touch ? "ontouchend" : "onmouseup"] = function(ev) {
      ev.x = touch && mouseMoveEvent ? mouseMoveEvent.x : mouseDownEvent.x;
      ev.y = touch && mouseMoveEvent ? mouseMoveEvent.y : mouseDownEvent.y;
      enhance(ev,mouseDownEvent);
      // console.log("move", direction, abs(ev.dx));
      // alert("touchend");
      if (direction=="x" && abs(ev.dx) > opts.minSwipe) opts.swipeX(ev);
      else if (direction=="y" && abs(ev.dy) > opts.minSwipe) opts.swipeY(ev);
      else (+new Date - startTime < opts.maxClickTime) ? opts.click(ev) : opts.longHold(ev);
      direction = mouseDownEvent = mouseMoveEvent = null;
      return false;
    };

    return $(this);

  };

  $.fn.touch.defaults = {
    move: null,
    small: null,
    minMove: 5,
    minSwipe: 20,
    maxClickTime: 500
  };

  function untouch(el) {
    var handlers = "touchstart,touchmove,touchend,mousedown,mousemove,mouseup".split(",")
    for (var handler in handlers) {
      el["on"+handler] = null;
    }
  }

  function isTouchDevice() {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  }

  var abs = Math.abs;

}(jQuery);

function log() { // combine into one string for android logcat
  var s="";
  for (var i=0; i<arguments.length; i++) {
    s+=arguments[i] + ",";
  }
  console.log(s);
}
