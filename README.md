io-reader server
================

This is a basic proxying server that has some state.

The server runs an instance of the configuration document, which includes the type of API proxy to use and the categories to display.

There are two API proxies included:

*  Guardian
*  NPR

Installation
------------

*  [Install Node v0.4.12](https://github.com/joyent/node/wiki/Installation)
*  [Install npm](http://npmjs.org/)

Now you can install the dependencies:

    npm install express mustache async less uglify-js

Running the app
---------------

    ./run.sh <CONFIG_NAME>

Where `<CONFIG_NAME>` is the name of a folder in `<PROJECT_ROOT>/config`.

Configuring your app
--------------------

Each application needs a configuration to run, the configuration defines properties such as:

1.  The port and hostname for the application to listen on.
2.  The name and description of the application
3.  The directory where the client code is (it can be anywhere you want)
4.  The API proxy to use (Guardian, NPR, GoogleFeedApi etc)
    1.   The parameters for the API, such as API Keys
5.  The columns to display in the app
    1.   And proxy specific parameters

Example Configuration: Google Feed API
---------------------------------------

    exports.config = { 
        id: "googlefeed",
        name: "Chrome Developer Relations",
        description: "All the latest news from around the Chrome team",
        version: "0.0.0.11",
        baseDir: "server/templates/",
        clientDir: "client/",
        categories: [
            { 
                id: "pk", url : "http://paul.kinlan.me/rss.xml", title: "Paul Kinlan"
            },
            { 
                id: "mm", url : "http://softwareas.com/rss.xml", title: "Mike Mahemoff"
            }, 
            {
                id: "ig", url : "http://greenido.wordpress.com/rss.xml", title : "Ido Green"
            },
            {
                id: "smus", url : "http://smus.com/rss.xml", title : "Boris Smus"
            }
        ],
        options: {
            appCache: "",
            port: 3000,
            proxies: {
                "googlefeed": {
                    referer: "http://paul.kinlan.me/"
                }
            }
        }
    };

Most of it is pretty self explanatory, the categories array is specific to the provider.  The Guardian API proxy is a simple collection of category names.  The NPR API proxy is a collection of category numbers.

For a given proxy, there might require some specific parameters such as API Keys.
