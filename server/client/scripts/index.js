$(function() {
 /*
   * Every internal link will use pushState
   *
   */
$("a[href='/']").live("click", function(e) {
  debugger;
  window.history.pushState(e.target.href, "");
});

var ui = localStorage.ui || "phone";
$.get("css/"+ui+".less", function(lessSheet) {
  (new less.Parser).parse(lessSheet, function(err,tree) {
    if (err) { console.log("stylesheet error", err); }
    $("<style/>").html(tree.toCSS()).appendTo("body");
  });
});
$("<script src='js/"+ui+".js' />").appendTo("body");


$(".categories").click(function() {
  window.history.pushState(undefined, "IO-reader", "/");
  $("html").attr("class", "menuState");
  $(".category").removeClass("active");
});

$(".category").click(function() {
  window.history.pushState(undefined, this.alt, "/reader/" + this.id);
  $("html").attr("class", "categoryState");
  $(".category").removeClass("active");
  $(this).addClass("active");
  return false;
});

$("[dlc=story]").click(function() {
  window.history.pushState(undefined, this.alt, this.pathname);
  $("html").attr("class", "storyState");
  $(".category").removeClass("active");
  $(this).closest(".category").addClass("active");
  $(".story").attr("src", this.href);
  return false;
});
});
var r = new routes();
  r.get("/reader/:category\\.:format", function(req) {
   console.log(req);
  });

  r.get("/reader/:category", function(req) {
    console.log(req);
  });

  r.get("/", function(req) {
   console.log(req);
  });

/*
$(function() {
  $("[data-link-class='category']").click(function() {
    $("html").attr("data-resource", "category");
    var matches = this.href.match(/^(?:.*\/)?(.+)\.html$/);
    console.log("match", matches);
    if (matches) {
      $(".category").removeClass("active");
      $("#"+matches[1]).addClass("active");
      // $(".story").hide().show(); // weird chrome bug
    };
    return false;
  });
  $("[data-link-class='story']").click(function() {
    $("html").attr("data-resource", "story");
    $(".story").attr("src", this.href);
    // $(".story,.category").hide().show(); // weird chrome bug
    return false;
  }); 
});
*/

