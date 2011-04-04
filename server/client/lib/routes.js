var routes = function() {
  var routes = [];

  var buildRegexp = function(path) {
    this.parseGroups = function(loc) {
      var nameRegexp = new RegExp(":([^/.]+)", "g"); 
      var newRegexp = "";
      var groups = {};
      var matches = null;
      var i = 0;
      var start = 0;
      while(matches = nameReqexp.exec(loc)) {
        groups{matches[1]} = i++;
        newRegexp += loc.substr(start, matches[1].length) + "([^/.]+)";
        start +=  matches[0].length;
      }

      return { "groups" : groups, "regexp": new RegExp(newRegexp)};
    };
      
    return this.parseGroups(path); 
  };

  var matchRoute = function(url) {
    var route = null;
    for(var i = 0; route = routes[i]; i ++) {
      var result = {
        groups: [],
        callback
      };

      var routeMatch = route.match(url);

    }

    return null;
  };

  this.get = function(route, callback) {
    routes.add({regex: new RegExp(route), "callback": callback});
  };

  var attach = function() {
    window.addEventListener("popstate", function(e) {
      matchRoute(document.location); 
    });
  };

  attach();
};
