var koa = require('koa');
var util = require('./util');
var path = require('path');

var app = new koa();

module.exports = function (config) {
  var base = config.base;
  var relbase = function (p) {
    return base ? path.relative(base, p) : p;
  }
  var middlewares = [];

  app.use(async function (context, next) {
    context.config = config;
    await next();
  });

  if (!config.path) config.path = {};

  function processRecipe(recipe, extra) {
    if (!extra.path) return;
    var recipe = new recipe(app, extra);
    var filter = recipe.filter || /\.js$/;
    var gf = function () { return util.getFilesFromDir(extra.path).filter(function (x) { return filter.test(x)});}
    var files = gf();
    if (recipe.setup) recipe.setup(files);
    var watch = recipe.fullReload || recipe.watchCallback;
    if (watch && config.isDevelopment) {
      util.watch(extra.path, function(path) {
        try {
          if (filter.test(path)) {
            delete require.cache[path];
            console.log('reloading file ' + relbase(path) + ' for ' + recipe.name || ' unknown recipe');
            if (recipe.fullReload) recipe.setup(gf());
            if (recipe.watchCallback)  recipe.watchCallback(path);
          }
        } catch (e) {
          console.log(e);
        }
      });
    };
    if (recipe.name) console.log('recipe ' + recipe.name + ' loaded');
  }

  function start() {
      console.time('loading recipes');
      // bootstrap recipes
      processRecipe(require('./service'), {path: config.path.service, lowerCasify: config.serviceLowerCasify});
      processRecipe(require('./middleware'), {path: config.path.middleware});
      middlewares.forEach(fn => app.use(fn));
      processRecipe(require('./controller'), {path: config.path.controller});
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
    addMethod: addMethod,
    addMiddleware: (fn) => middlewares.push(fn),
    start: start,
    util: util, // utilities
    koa: app,  // get the koa instance
    use: app.use.bind(app), // the koa `use` method
  };
};
