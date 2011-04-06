!function($) {

  log("defining swipe");

  var mouseDownEvent = null;
  var mouseMoveEvent = null;

  $.fn.swipe = function(swipeend, options) {

    var opts = $.extend({}, $.fn.swipe.defaults, options);

    function enhanceEvent(ev,epochEvent) {
      ev.dx = ev.x - epochEvent.x;
      ev.dy = ev.y - epochEvent.y;
      switch(opts.direction) {
        case "x": ev.distance = Math.abs(ev.dx); break;
        case "y": ev.distance = Math.abs(ev.dy); break;
        default: ev.distance = Math.sqrt(ev.dx*ev.dx + ev.dy*ev.dy);
      }
    }

    $(this).mousedown(function(ev) {
      log("md handler", ev.x,ev.y);
    });

    /*
    $(this).mouseout(function(ev) {
      if (mouseDownEvent) {
        enhanceEvent(ev,mouseDownEvent);
        if (ev.distance > opts.threshold) swipeend(ev);
        mouseDownEvent = null;
        mouseMoveEvent = null;
      }
    });
    */

    $(this).mouseup(function(ev) {
      enhanceEvent(ev,mouseDownEvent);
      if (ev.distance > opts.threshold) swipeend(ev);
      else if (opts.small) opts.small(ev);
      mouseDownEvent = null;
      mouseMoveEvent = null;
      log("mu handler");
    });

    $(this).mousemove(function(ev) {
      if (!mouseDownEvent) return;
      var lastEvent = mouseMoveEvent || mouseDownEvent;
      enhanceEvent(ev,lastEvent);
      mouseMoveEvent = ev;
      if (opts.move) opts.move(ev);
      log("mm handler", mouseMoveEvent.x, mouseMoveEvent.y);
    });

  };

  $.fn.swipe.defaults = {
    move: null,
    small: null,
    direction: "any",
    threshold: 20
  };

  var touchable = isTouch();

  function neutralize(ev) {
    ev.x = touchable ? ev.touches[0].pageX : ev.clientX;
    ev.y = touchable ? ev.touches[0].pageY : ev.clientY;
    return ev;
  }

  $.fn.mousedown = function(callback) {
    alert("welcome");
    $(this).each(function(i, el) {
      log("md");
      el.addEventListener(touchable ? "touchstart" : "mousedown", function(ev) { 
        mouseDownEvent = neutralize(ev);
        log(touchable ? "REGISTER ts" : "REGISTER md", ev.x, ev.y);
        callback.call(el, neutralize(ev));
        return false;
      });
    });
  }

  $.fn.mousemove = function(callback) {
    $(this).each(function(i, el) {
      // el.addEventListener(touchable ? "touchmove" : "mousemove", function(ev) { 
      el[touchable ? "ontouchmove" : "onmousemove"] = function(ev) {
        // log("mm", ev.x, ev.y);
        callback.call(el, neutralize(ev));
        return false;
      };
    });
  }

  $.fn.mouseup = function(callback) {
    $(this).each(function(i, el) {
      el.addEventListener(touchable ? "touchend" : "mouseup", function(ev) { 
        ev.x = touchable ? mouseMoveEvent.x : mouseDownEvent.x;
        ev.y = touchable ? mouseMoveEvent.y : mouseDownEvent.y;
        log("mu", ev.x, ev.y);
        callback.call(el, ev);
        return false;
      });
    });
  }

  function isTouch() {
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


