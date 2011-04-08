// Copyright 2011 Google Inc. All Rights Reserved.
//
// Use of this source code is governed by a BSD-type license.
// See the COPYING file for details.

/**
 * A command-line precompiler for an ExCSS file.
 *
 * Author: Benjamin Kalman <kalman@chromium.org>
 * Modified: Paul Kinlan <paulkinlan@google.com>
 */

var fs = require('fs');
var exCss = require('./excss_module.js');

function compile(filename) {
  var data = fs.readFileSync(filename);
  if (!data) {
    console.log('Failed to read ' + filename);
    return;
  }
  fs.writeFileSync(filename, exCss.precompile(data, true));
  console.log('Compilation of ' + filename + ' successful.');
}

if (process.argv.length <= 2) {
  console.log('Usage: node ' + process.argv[1] + ' filename.excss...');
  process.exit(1);
}

var operation = process.argv[1]

process.argv.slice(2).forEach(compile);
