var Koa = require('koa')
var util = require('./util')
var path = require('path')

var app = new Koa()
var DEFAULT_FILTER = /[.](ts|js)$/

function noop () {}
function isTestFile (file) {
  return file.indexOf('.test.') !== -1 || file.indexOf('.spec.') !== -1
}

// for testing. see today.spec.js
global.__REKOA_TEST_FN = function () { return 0 }
async function middlewareForTest (context, next) {
  if (context.path === '/REKOA_TEST') {
    await context.$injector.invoke(global.__REKOA_TEST_FN)
    context.body = ''
    return
  }
  await next()
}

module.exports = function (config) {
  var base = config.base
  var relbase = function (p) {
    return base ? path.relative(base, p) : p
  }
  var middlewares = []

  app.use(async function (context, next) {
    const serverTimings = context.serverTimings || []
    context.serverTimings = serverTimings
    context.startTime = function (name, desc) {
      const start = Date.now()
      return () => {
        serverTimings.push({ name, desc, ms: Date.now() - start })
      }
    }
    context.config = config
    await next()
  })

  if (!config.path) config.path = {}

  function processRecipe (Recipe, extra) {
    if (!extra.path) return
    var recipe = new Recipe(app, extra)
    var filter = recipe.filter || DEFAULT_FILTER
    var gf = function () {
      return util
        .getFilesFromDir(extra.path)
        .filter(function (x) { return filter.test(x) })
        .filter(function (x) { return !isTestFile(x) })
    }
    var files = gf()
    if (recipe.setup) recipe.setup(files)
    var watch = recipe.fullReload || recipe.watchCallback
    if (watch && config.isDevelopment) {
      util.watch(extra.path, function (path) {
        try {
          if (filter.test(path) && !isTestFile(path)) {
            delete require.cache[path]
            console.log('reloading file ' + relbase(path) + ' for ' + recipe.name || ' unknown recipe')
            if (recipe.fullReload) recipe.setup(gf())
            if (recipe.watchCallback) recipe.watchCallback(path)
          }
        } catch (e) {
          console.log(e)
        }
      })
    };
    if (recipe.name) console.log('recipe ' + recipe.name + ' loaded')
  }

  var server
  function start () {
    console.time('loading recipes')
    // bootstrap recipes
    processRecipe(require('./service'), { path: config.path.service, lowerCasify: config.serviceLowerCasify })
    processRecipe(require('./middleware'), { path: config.path.middleware })
    middlewares.push(middlewareForTest)
    middlewares.forEach(fn => app.use(fn))
    processRecipe(require('./controller'), { path: config.path.controller })
    console.timeEnd('loading recipes')

    var port = (config.port || 0) - 0
    // reason to support port < 0 is that app developer
    // can override port with -1 to get an abitrary port
    // when they run tests.
    if (port < 0) port = 0
    console.time('start')
    server = app.listen(port, function () {
      console.timeEnd('start')
      console.log('server listening on ', server.address().port);
      // only for readiness detection.
      (config.callback || noop)()
    })
  }

  function addMethod (name, fn) {
    app[name] = fn
  }

  // check readiness every 100ms
  function ready () {
    return new Promise((resolve, reject) => {
      function check () {
        try { return resolve(server.address().port) } catch (e) { }
        return setTimeout(check, 100)
      }
      check()
    })
  }

  return {
    addMethod: addMethod,
    addMiddleware: (fn) => middlewares.push(fn),
    getServer: () => server, // returns Node.js Server
    ready: ready, // if ready, return the listened port
    start: start,
    util: util, // utilities
    koa: app, // get the koa instance
    use: app.use.bind(app) // the koa `use` method
  }
}

module.exports.version = require('./package.json').version
