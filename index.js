const Koa = require('koa')
const util = require('./util')
const path = require('path')
const now = require('performance-now')

const app = new Koa()
const DEFAULT_FILTER = /[.](ts|js)$/

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
  if (config.isDevelopment) {
    global.__REKOA_IS_DEV = true
  }
  const base = config.base
  const relbase = function (p) {
    return base ? path.relative(base, p) : p
  }
  const middlewares = []

  app.use(async function (context, next) {
    const serverTimings = context.serverTimings || []
    context.serverTimings = serverTimings
    context.startTime = function (name, desc) {
      const start = now()
      return () => {
        serverTimings.push({ name, desc: desc || name, ms: now() - start })
      }
    }
    context.timing = function (name, desc, fn) {
      if (typeof desc === 'function') {
        fn = desc
        desc = null
      }
      const end = context.startTime(name, desc)
      const result = fn()
      Promise.resolve(result).then(end)
      return result
    }
    context.config = config
    await next()
  })

  if (!config.path) config.path = {}

  function processRecipe (Recipe, extra) {
    if (!extra.path) return
    const recipe = new Recipe(app, extra)
    const filter = recipe.filter || DEFAULT_FILTER
    const gf = function () {
      return util
        .getFilesFromDir(extra.path)
        .filter(function (x) { return filter.test(x) })
        .filter(function (x) { return !isTestFile(x) })
    }
    const files = gf()
    if (recipe.setup) recipe.setup(files)
    const watch = recipe.fullReload || recipe.watchCallback
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

  let server
  function start () {
    console.time('loading recipes')
    // bootstrap recipes
    processRecipe(require('./service'), { path: config.path.service, lowerCasify: config.serviceLowerCasify })
    processRecipe(require('./middleware'), { path: config.path.middleware })
    middlewares.push(middlewareForTest)
    middlewares.forEach(fn => app.use(fn))
    processRecipe(require('./controller'), { path: config.path.controller })
    console.timeEnd('loading recipes')

    let port = (config.port || 0) - 0
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
    triggerWatch: util.trigger, // dev only
    getServer: () => server, // returns Node.js Server
    ready: ready, // if ready, return the listened port
    start: start,
    util: util, // utilities
    koa: app, // get the koa instance
    use: app.use.bind(app) // the koa `use` method
  }
}

module.exports.version = require('./package.json').version
