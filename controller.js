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
    var pages = [];
    files.forEach(function (file) {
      const absfile = require.resolve(file);
      var page = require(file);

      if (typeof page === 'function') page = page(app);
      if (!page || !Object.keys(page).length) return {};
      if (!Array.isArray(page)) page = [page];

      page.forEach(function (p, i) {
        pages.push({
          url: p.url,
          controller: p.controller,
          method: [].concat(p.method || p.methods || "get").map(x => x.toUpperCase())
        });
      });
    });
    app.pages = pages;

    // route pages
    pages.forEach(function (page) {
      if (!(page && page.controller)) return;

      var responseController = routeController(app, page);
      var url = page.url.indexOf('/') !== '0' ? '/' + url: '';
      router.define(page.url).forEach(node => {
        node.controllers = [].concat(node.controllers).concat([{
          method: page.method,
          methods: page.method,
          fn: responseController
        }]).filter(Boolean);
      });
    });
  }

  app.use(function * (next) {
    var match = router.match(this.path);
    var controllers = match && match.node && match.node.controllers;
    if (!controllers) {
      this.body = 'no route found';
      return;
    }
    var controller;
    for (var i = 0; i < controllers.length; i++) {
      var methods = controllers[i].methods;
      if (methods.indexOf(this.method) > -1) {
        controller = controllers[i];
        break;
      }
    }
    if (!controller) {
      this.body = 'no supported controller found';
      return;
    }
    this.matchRoute = match.node;
    this.params = match.param;
    yield controller.fn.call(this, next);
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

