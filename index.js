var koa = require('koa');
var glob = require('glob');
var util = require('./util');
var path = require('path');

var app = koa();
app.experimental = true;

module.exports = function (config) {
  var base = config.base;
  var relbase = function (p) {
    return base ? path.relative(base, p) : p;
  }
  var recipes = [];

  if (!config.path) config.path = {};
  addRecipe(require('./middleware'), {path: config.path.middleware});
  addRecipe(require('./context'), {path: config.path.context});
  addRecipe(require('./controller'), {
    path: config.path.controller,
    templatePath: config.path.template,
    templateExtension: config.templateExtension || '.html'
  });

  function addRecipe(recipe, extra) {
    recipes.push({
      recipe: recipe,
      extra: extra
    });
  };

  function start() {
      console.time('loading recipes');
      // bootstrap recipes
      recipes.forEach(function(rec) {
        if (!rec.extra.path) return;
        var recipe = new rec.recipe(app, rec.extra);
        var filter = recipe.filter || /\.js$/;
        var gf = function () { return util.getFilesFromDir(rec.extra.path).filter(function (x) { return filter.test(x)});}
        var files = gf();
        if (recipe.setup) recipe.setup(files);
        var watch = recipe.fullReload || recipe.watchCallback;
        if (watch && config.isDevelopment) {
          util.watch(rec.extra.path, function(path) {
            if (filter.test(path)) {
              if (!util.checkSyntax(path)) {
                delete require.cache[path];
              } else {
                return console.error('syntax error', util.checkSyntax(path))
              }
              delete require.cache[path];
              console.log('reloading file ' + relbase(path) + ' for ' + recipe.name || ' unknown recipe');
              if (recipe.fullReload) recipe.setup(gf());
              if (recipe.watchCallback)  recipe.watchCallback(path);
            }
          });
        };
        if (recipe.name) console.log('recipe ' + recipe.name + ' loaded');
      });
      console.timeEnd('loading recipes');

      var port = config.port || 8080;
      console.time('start');
      app.listen(port, function () {
        console.timeEnd('start');
        console.log('server listening on ', port);
      });
  }

  function addMethod(name, fn) {
    app[name] = fn;
  }

  return {
    addRecipe: addRecipe, 
    addMethod: addMethod,
    start: start,
    util: util, // utilities
    koa: app,  // get the koa instance
    use: app.use.bind(app), // the koa `use` method
  };
};
