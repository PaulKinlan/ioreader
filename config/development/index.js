/*   
   Copyright 2011 Google Inc

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

exports.config = { 
  id: "googlefeed",
  name: "DEMO",
  description: "All the latest news from around the world",
  version: "0.0.0.11",
  baseDir: "server/templates/",
  clientDir: "client/",
  categories: [
    { 
      id: "pk", url : "http://paul.kinlan.me/rss.xml", title: "Paul Kinlan"
    },
    { 
      id: "mm", url : "http://softwareas.com/feed", title: "Mike Mahemoff"
    }, 
    {
      id: "ig", url : "http://greenido.wordpress.com/rss.xml", title : "Ido Green"
    },
    {
      id: "smus", url : "http://feeds.feedburner.com/smuscom", title : "Boris Smus"
    }
  ],
  options: {
    appCache: "",
    port: 3000,
    proxies: {
      "googlefeed": {
        apiKey: "ABQIAAAAsiHqxvXX0oZ3kEtFwnOcjRT2lTflwaphDlNjWpGbs99SsOTe9RRXV8vQE_JNE1T3BY_A8GXqoKxjQg",
        referer: "http://paul.kinlan.me/"
      }
    }
  }
};
