formfactor.register({
  "desktop": [
    "screen"
  ]
});

formfactor.detect([
  {
    "formfactor": "desktop",
    "resources": ["/scripts/desktop/controller.js", "/lib/excss.js", "/css/desktop/desktop.excss"]
  },
  {
    "formfactor": "phone",
    "resources": ["/scripts/phone/swipe.js", "/scripts/phone/controller.js", "/lib/less.js", "/css/phone/phone.less"]
  }

]);
