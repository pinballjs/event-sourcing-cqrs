'use strict';

let prettyjson = require('prettyjson');

function print(msg) {
  console.log(prettyjson.render(msg));
  console.log('==========================================================================================');
}

exports.print = print;
