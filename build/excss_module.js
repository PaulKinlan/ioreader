// Copyright 2011 Google Inc. All Rights Reserved.
//
// Use of this source code is governed by a BSD-type license.
// See the COPYING file for details.

/**
 * Exposes part of the ExCSS API for use from nodejs.
 *
 * Author: Benjamin Kalman <kalman@chromium.org>
 */

// Import ExCSS with a fake window.  We don't actually need to emulate anything
// (e.g. document) since ExCSS won't access any of the DOM API unless it's run
// in the browser, but we need to define it so that it can export the ExCSS API,
// which is needed for CSS.parse.
var savedGlobalWindow = global.window;
global.window = {};
require('./excss.js');
var exCss = global.window.CSS;

// Precompiles some ExCSS markup, to return the original data with the compiled
// JSON attached as a comment.
exports.precompile = function(data, insertAtEnd) {
  if (!(data instanceof String)) {
    data = new String(data);
  }
  var markup = exCss.extractMarkupAndParseObject(data).markup.trim();
  var parseObject = undefined;
  try {
    parseObject = exCss.parse(markup);
  } catch (e) {
    console.warn('Exception thrown while parsing ExCSS: ' + e);
  }
  if (!parseObject) {
    console.warn('Could not parse ExCSS markup ' + data);
    return data;
  }
  var json = JSON.stringify(parseObject);
  if (insertAtEnd) {
    return markup + '\n\n/*{{{' + json + '}}}*/\n';
  } else {
    return '/*{{{' + json + '}}}*/\n\n' + markup;
  }
};

global.window = savedGlobalWindow;
