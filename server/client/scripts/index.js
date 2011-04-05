$(function() {

$("[dlc=story]").click(function() {
  $("html").attr("class", "storyState");
  $(".category").removeClass("active");
  $(this).closest(".category").addClass("active");
  $(".story").attr("src", this.href);
  return false;
});
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

