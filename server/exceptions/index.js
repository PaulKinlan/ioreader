var Exception = function() {};

var NoCallbackException = function() {};

NoCallbackException.prototype = new Exception();
NoCallbackException.prototype.constructor = Exception.constructor;

var RequiredException = function() {};
RequiredException.prototype = new Exception();
RequiredException.prototype.constructor = Exception.constructor;

exports.RequiredException = RequiredException;
exports.NoCallbackException = NoCallbackException;
