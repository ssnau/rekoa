var injecting = require('injecting')
var util = require('./util')
var path = require('path')
// Service setup!
module.exports = function (app, extra) {
  var servicePath = extra.path
  // Data Injection setup!
  app.use(async function (context, next) {
    var injector = injecting()
    context.$injector = injector
    context._use_data_injection = true
    context.getInjection = function (name) {
      // if 'name' is a Class
      if (name.INJECTING_NAME) return injector.get(name.INJECTING_NAME)
      return injector.get(name)
    }

    injector.register('context', context)
    injector.register('app', context.app)
    if (context.pendingInjections) {
      context.pendingInjections.forEach(fn => fn(injector))
    }

    await next()
    context.$injector = null // gc
  })
  // either is OK.
  app.services = {}
  app.service = app.services
  if (!servicePath) return

  function loadService (file) {
    var Service = require(file)
    Service = (Service && Service.default) || Service
    if (!Service) return

    const serviceName = path.relative(servicePath, file)
      .replace(/\.ts$/, '')
      .replace(/\.js$/, '')
    const dollarName = serviceName.replace(/\//g, '$')
    function register (name) {
      if (!name) return
      app.service[name] = Service
      if (extra.lowerCasify && lcfirst(name) !== name) {
        app.service[lcfirst(name)] = Service
      }
    }
    register(serviceName)
    register(dollarName)
    if (!Service.INJECTING_NAME) {
      util.assignProperty(Service, 'INJECTING_NAME', serviceName)
    }
    register(Service.INJECTING_NAME)
  }

  app.use(async function (context, next) {
    Object.keys(app.service).forEach(function (key) {
      return context.$injector.register(key, app.service[key])
    })
    await next()
  })

  util.getFilesFromDir(servicePath).filter(function (x) {
    if (/spec.js/.test(x)) return false
    if (/spec.ts/.test(x)) return false
    return (/js$/.test(x)) || (/ts$/.test(x))
  }).forEach(loadService)

  return {
    filter: /[.](ts|js)$/,
    setup: function callback (files) {
      files.forEach(f => loadService(f))
    },
    watchCallback: function (path) {
      loadService(path)
    },
    name: 'service'
  }
}
function lcfirst (str) {
  //  discuss at: http://locutus.io/php/lcfirst/
  // original by: Brett Zamir (http://brett-zamir.me)
  //   example 1: lcfirst('Kevin Van Zonneveld')
  //   returns 1: 'kevin Van Zonneveld'
  str += ''
  var f = str.charAt(0)
    .toLowerCase()
  return f + str.substr(1)
}
