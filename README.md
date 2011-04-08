io-reader server

This is a basic proxying server that has some state.

The server serves the configuration document, and each of the mapped objec

The server will proactivly fetch and map content to the output format.

Installation.

Install node.

npm install express
npm install mustache
npm install async
npm install less

* Running the app *

There are three modes to run the application. Test, Development and Production.

** Test **

Test mode runs with a dummy data provider that allows you quick and consistent access to the app and allows you to work offline.
In an emergency, this can be used to host demo for IO.
Test mode runs with all the same parameters as development mode.

Test mode is the default mode.

** Development **

Development mode runs the code against a real data source.
Exceptions are show, and the stackTrace too.
All Logging is sent to the STDOUT.

To enter development mode, run ./setmode.sh dev

** Production **
Exceptions and Stack traces are disabled.
All client code and HTML is minified.
All logging is disabled.

Note: Before production can be run, a build process must be initiated.

build.py .

To enter production mode, run ./setmode.sh prod

node server.js


