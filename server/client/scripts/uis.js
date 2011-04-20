formfactor.register({
  'desktop': [
    'screen'
  ],
  'phone': [
    'screen' // TODO(mm): use real media query.
  ],
  'tv': [
    'screen' // TODO(smus): use real media query.
  ],
  'tablet': [
    'screen' // TODO(ericbidelman): use real media query.
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
      window.location = window.location;
    });
  
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"phone\">Phone</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"tablet\">Tablet</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"desktop\">Desktop</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"tv\">TV</a>");
  });
}
