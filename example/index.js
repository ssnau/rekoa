require('babel/register');
var app = require('../');
var path = require('path');

app({
  isDevelopment: true,
  base: __dirname,
  path: {
    middleware: path.join(__dirname, 'middleware'),
    controller: path.join(__dirname, 'controller')
  }
}).bootstrap();


