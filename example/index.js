require('babel/register');
var rekoa = require('../');
var path = require('path');
var fsp  = require('fs-promise');
var handlebars = require('handlebars');

var app = rekoa({
  isDevelopment: true,
  base: __dirname,
  port: 8080,
  templateExtension: '.hbs',
  path: {
    middleware: path.join(__dirname, 'middleware'),
    controller: path.join(__dirname, 'controller'),
    context: path.join(__dirname, 'context'),
    template: path.join(__dirname, 'template'),
  }
});

app.addMethod('render', function(file, data) {
  return fsp.readFile(file, 'utf8').then(function(template) {
    return handlebars.compile(template)(data);
  });
});

app.start();

