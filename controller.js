/**
 * 作用：支持热替换的路由模块。
 **/
var glob = require("glob");
var path = require("path");
var fs = require("fs");
var compose = require("composition");
var _ = require("lodash");

module.exports = function (app, extra) {
  var routes = null;
  function getPages(files) {
    var pages = {};
    files.forEach(function (file) {
      var templateBase = extra.template;

      const absfile = require.resolve(file);
      /*
      if (app.config.serverHMR && require.cache[absfile] && changedPaths.indexOf(absfile) > -1) {
        console.log('reloading ', absfile);
        if (!util.checkSyntax(absfile)) {
          delete require.cache[absfile];
        } else {
          console.log('syntax error', util.checkSyntax(absfile))
        }
      }
      */
      var page = require(file);

      if (typeof page === 'function') {
        page = page(app);
      }

      if (!page || !Object.keys(page).length) return {};
      if (!Array.isArray(page)) page = [page];

      page.forEach(function (p, i) {
        var name = path.relative(app.config.path.controller, file);
        // so that base itself becomes "/"
        name = "/" + name;

        var key = "";
        if (page.length > 1) key = ":" + i;

        var template = "/the/path/never/exists";

        if (Array.isArray(p.url)) {
          template = "Your url is an array, router won't infer template path for you. Please specify templateName by yourself.";
        }

        if (typeof p.url === 'string') {
          var template = path.join(templateBase,  p.url.replace(/:/g, '').replace(/\*.*/g, ''));
          template = path.join(template, "index.jsx"); 
        }

        if (p.templateName) {
          var template = path.join(templateBase, p.templateName);
          template = path.join(template, "index.jsx"); 
        }

        templateExist = fs.existsSync(template)

        pages[name + key] = {
          url: p.url,
          name: name + key,
          controller: p.controller,
          method: [].concat(p.method || "get"),
          templateBase: templateBase,
          template: template,
          foundTemplate: fs.existsSync(template)
        };
      });

    });
    app.pages = pages;
    return pages;
  }
  function getRoutes(files) {
    // boot on startup
    var pages = getPages();
    // route pages

    var router = require("koa-router")();

    Object.keys(pages || {}).forEach(function (name) {
      var page = pages[name];
      if (!(page && page.controller)) return;

      var responseController = routeController(app, page, debug);
      page.method.forEach(function (method) {
        [].concat(page.url).forEach(function(url) {
          router[method](url, responseController);
        });
      });
    });

    routes = router.routes();
  }


  app.use(function * (next) {
    try {
      yield* routes.call(this, next);
    } catch (e) {
      app.emit("error", e);
      this.status = 500;
      this.error = e;
      yield* next;
    }
  });

  return {
    filter: /js$/,
    setup: getRoutes,
    fullReload: true,
    name: 'controller'
  };
};

function routeController(app, page, debug) {

  var extname = app.config.templateExtension || ".html";
  if (extname[0] !== ".") extname = "." + extname;

  var middlewares = page.middlewares || [];

  if (page.middlewares) {
    // in case middlewares is not array
    return compose([].concat(middlewares, responseController));
  }

  return responseController;

  function* responseController(next) {
    this.matchingRoute = page.name;

    var scope = yield page.controller.call(this, this.datasource);

    if (scope) {
      this.scope = scope;

      scope.$public = scope.$public || {};
      _.merge(scope.$public, app.$public);

      var tpl = page.template;

      if (!tpl) {
        var err = new Error();
        err.name = "template undefined";
        err.stack = page.name + " has undefined template";
        err.context = this;
        app.emit("error", err);
      }

      var body;
      try {
        body = yield * app.render(tpl, scope);
      } catch (e) {
        body = "Internal Server Error";
        this.status = 500;

        e.name = "render error";
        e.context = this;
        app.emit("error", e);
      }

      this.body = body;

      yield app.fire("renderEnd", this);
    }

    // mark for GC
    this.scope = scope = null;

  };
}