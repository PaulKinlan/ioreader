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
    "resources": ["/scripts/desktop/controller.js", "/css/desktop.css", {href: "http://fonts.googleapis.com/css?family=Allerta+Stencil:400|Droid+Sans", rel:"stylesheet", tag:"link", type: "text/css", urlKind: "href"}]
  },
  {
    "formfactor": "phone",
    "resources": ["/scripts/phone/jquery.touch.js", "/scripts/phone/controller.js", "/lib/less.js", "/css/phone/phone.less"]
  },
  {
    "formfactor": "tv",
    "resources": ["/scripts/tv/controller.js", "/lib/excss.js", "/css/tv/tv.excss"]
  },
  {
    "formfactor": "tablet",
    "resources": ["/scripts/tablet/controller.js", "/lib/less.js", "/css/tablet/tablet.less"]
  }
]);

if(!!factor) {
  $(document).ready(function() {
    $("#formfactors a").live("click", function(e) {
      formfactor.override($(this).data().formfactor);
      window.location = window.location;
    });
  
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"phone\">Phone</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"tablet\">Tablet</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"desktop\">Desktop</a>");
    $("#formfactors").append("<a href=\"#\" data-formfactor=\"tv\">TV</a>");
  });
}
