var KeyController = function() {
  var onUpKey = function() {
  };

  var onDownKey = function() {
  };

  var onLeftKey = function() {
  };

  var onRightKey = function() {
  };

  // Bind to the keydown event
  window.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
      case 38: // up
        onKeyUp();
        break;
      case 40: // down
        onKeyDown();
        break;
      case 37: // left
        onKeyLeft();
        break;
      case 39: // right
        onKeyRight();
        break;
    }
  });

  return {
  };
}

KeyController.prototype.constructor = KeyController;

var keyController = KeyController();
