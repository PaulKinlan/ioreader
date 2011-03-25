/*
  A helper for the templating system.

  - Uses mustach, just need to load the data

*/

requires("fs");

exports.load = function (file, callback) {
  var fh = fs.readFile(file, function(err, data) {
    if(err) throw err;
    callback(data);
  });
};

