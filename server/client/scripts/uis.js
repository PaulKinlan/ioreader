formfactor.register({
  'desktop': [
    'screen'
  ],
  'phone': [
    (navigator.userAgent.indexOf(" Mobile ") > 0)
    (navigator.userAgent.indexOf("Android") > 0)
  ],
  'tv': [
    'tv', // TODO(smus): use real media query.
    (navigator.userAgent.indexOf("Google TV/") > 0)
  ],
  'tablet': [
    (navigator.userAgent.indexOf("iPad") > 0)
    (navigator.userAgent.indexOf("Xoom") > 0)
  ]
});

var factor = formfactor.detect([
  {
    "formfactor": "desktop",
    "resources": ["/scripts/desktop/controller.js", "/css/desktop.css"]
  },
  {
    "formfactor": "phone",
    "resources": ["/scripts/phone/jquery.touch.js", "/scripts/phone/controller.js", "/css/phone.css"]
  },
  {
    "formfactor": "tv",
    "resources": ["/scripts/tv/controller.js", "/css/tv.css"]
  },
  {
    "formfactor": "tablet",
    "resources": ["/css/tablet.css", '/css/tablet/touchscroll.css', "/scripts/tablet/css-beziers.js", "/scripts/tablet/touchscroll.js", "/scripts/tablet/controller.js"]
  }
]);

if(!!factor) {
  $(document).ready(function() {
    $("#formfactors a").live("click", function(e) {
      formfactor.override($(this).data().formfactor, { path: "/" });
      $("#formfactors a").removeClass("active");
      $(this).addClass("active");
      window.location.reload();
      return false;
    });
  
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"phone\">Phone</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"tablet\">Tablet</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"desktop\">Desktop</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"tv\">TV</a>");
    $("#formfactors [data-formfactor="+factor+"]").addClass("active");
  });
}
