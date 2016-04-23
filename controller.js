/**
 * 作用：支持热替换的路由模块。
 **/
var path = require("path");
var fs = require("fs");
var compose = require("composition");

module.exports = function (app, extra) {
  var router = null;
  function loadRoute(files) {
    router = require("routington")();
    // boot on startup
    var pages = {};
    files.forEach(function (file) {
      const absfile = require.resolve(file);
      var page = require(file);

      if (typeof page === 'function') page = page(app);
      if (!page || !Object.keys(page).length) return {};
      if (!Array.isArray(page)) page = [page];

      page.forEach(function (p, i) {
        pages[p.url] = {
          url: p.url,
          controller: p.controller,
          method: [].concat(p.method || p.methods || "get").map(x => x.toUpperCase())
        };
      });
    });
    app.pages = pages;

    // route pages
    Object.keys(pages || {}).forEach(function (name) {
      var page = pages[name];
      if (!(page && page.controller)) return;

      var responseController = routeController(app, page);
      var url = page.url.indexOf('/') !== '0' ? '/' + url: '';
      router.define(page.url).forEach(node => {
        node.controller = {
          method: page.method,
          methods: page.method,
          fn: responseController
        };
      });
    });
  }

  app.use(function * (next) {
    try {
      var match = router.match(this.path);
      var controller = match && match.node && match.node.controller;
      if (!controller) {
        this.body = 'no route found';
        return;
      }
      var methods = controller.methods;
      if (methods.indexOf(this.method) === -1) {
        this.body = 'no supported method found';
        return;
      }
      this.matchRoute = match.node;
      this.params = match.param;
      yield controller.fn.call(this, next);
      console.log('this.body is', this.body);
    } catch (e) {
      console.error("\n========\n", e.stack, "\n=========\n");
      this.status = 500;
      this.error = e;
    }
  });

  function routeController(app, page) {
    var middlewares = page.middlewares || [];

    if (page.middlewares) {
      // in case middlewares is not array
      return compose([].concat(middlewares, responseController));
    }
    this.matchRoute = page;

    function* responseController(next) {
      yield this.$injector.invoke(page.controller, this);
    }

    return responseController;
  }

  return {
    filter: /js$/,
    setup: loadRoute, 
    fullReload: true,
    name: 'controller'
  };
};

