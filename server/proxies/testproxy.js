// Dynamically load the proxy
exports.load = function(name) {
  return require(name);
}
