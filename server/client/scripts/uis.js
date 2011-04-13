formfactor.register({
  "desktop": [
    "screen"
  ]
});

formfactor.detect([
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
