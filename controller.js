/**
 * 作用：支持热替换的路由模块。
 **/
const compose = require('koa-compose')

module.exports = function (app, extra) {
  let router = null
  function loadRoute (files) {
    router = require('routington')()
    // boot on startup
    const pages = []
    files.forEach(function (file) {
      let page = require(file)
      page = (page && page.default) || page

      if (typeof page === 'function') page = page(app)
      if (!page || !Object.keys(page).length) return {}
      if (!Array.isArray(page)) page = [page]

      page.forEach(function (p, i) {
        const urls = [].concat(p.url || p.urls)
        urls.forEach(function (url) {
          pages.push({
            url: url,
            controller: p.controller,
            method: [].concat(p.method || p.methods || 'get').map(x => x.toUpperCase())
          })
        })
      })
    })
    app.pages = pages

    // route pages
    pages.forEach(function (page) {
      if (!(page && page.controller)) return

      const responseController = routeController(page)
      router.define(page.url).forEach(node => {
        node.controllers = [].concat(node.controllers).concat([{
          method: page.method,
          methods: page.method,
          fn: responseController
        }]).filter(Boolean)
      })
    })
  }

  app.use(async function (context, next) {
    const endTime = context.startTime('routing')
    const match = router.match(context.path)
    const controllers = match && match.node && match.node.controllers
    if (!controllers) {
      context.body = 'no route found'
      context.status = 404
      endTime()
      return
    }
    let controller
    for (let i = 0; i < controllers.length; i++) {
      const methods = controllers[i].methods
      if (methods.indexOf(context.method) > -1) {
        controller = controllers[i]
        break
      }
    }
    if (!controller) {
      context.body = 'no supported controller found'
      context.status = 404
      endTime()
      return
    }
    context.matchRoute = match.node
    context.params = match.param
    endTime()
    await controller.fn.call(context, context, next)
  })

  function routeController (page) {
    const middlewares = page.middlewares || []

    if (page.middlewares) {
      // in case middlewares is not array
      return compose([].concat(middlewares, responseController))
    }

    async function responseController (context, next) {
      await context.$injector.invoke(page.controller, context)
    }

    return responseController
  }

  return {
    filter: /[.](ts|js)$/,
    setup: loadRoute,
    fullReload: true,
    name: 'controller'
  }
}
