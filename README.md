io-reader server
================

This is a basic proxying server that has some state.

The server runs an instance of the configuration document, which includes the type of API proxy to use and the categories to display.

There are two API proxies included:
*  Guardian
*  NPR

Installation
------------

*  Install node https://github.com/joyent/node/wiki/Installation
*  Install npm http://npmjs.org/
*  npm install express mustache async less uglify-js

Running the app
---------------

There are three modes to run the application. Test, Development and Production.

Test 
----

Test mode runs with a dummy data provider that allows you quick and consistent access to the app and allows you to work offline.
In an emergency, this can be used to host demo for IO.
Test mode runs with all the same parameters as development mode.

To enter Test mode, run ./run.sh test

Development
-----------
Development mode runs the code against a real data source.
Exceptions are show, and the stackTrace too.
All Logging is sent to the STDOUT.

To enter development mode, run ./run.sh development

Production
----------

Exceptions and Stack traces are disabled.
All client code and HTML is minified.
All logging is disabled.

To enter production mode, run ./run.sh production

When production mode is run, it will compile all the latest changes to the CSS and minify the JS - no live changes to the less files are allowed.
