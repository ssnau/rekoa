var rekoa = require('../');
var path = require('path');
var fsp  = require('fs-promise');
var handlebars = require('handlebars');

var app = rekoa({
  isDevelopment: true,
  base: __dirname,
  port: 8080,
  path: {
    service: path.join(__dirname, 'service'),
    middleware: path.join(__dirname, 'middleware'),
    controller: path.join(__dirname, 'controller'),
  }
});

app.start();

