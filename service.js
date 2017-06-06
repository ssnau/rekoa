'use strict';

var injecting = require('injecting');
var util = require('./util');
// Service setup!
module.exports = function (app, extra) {
  var servicePath = extra.path;
  // Data Injection setup!
  app.use(function* (next) {
    var _this = this;

    var injector = injecting();
    this.$injector = injector;
    this._use_data_injection = true;

    injector.register('context', this);
    injector.register('app', this.app);
    if (this.pendingInjections) {
      this.pendingInjections.forEach(fn => fn(injector));
    }

    yield next;
    this.$injector = null; // gc
  });
  // either is OK.
  app.services = {};
  app.service = app.services;
  if (!servicePath) return;

  function loadService(file) {
    var Service = require(file);
    if (!Service) return;

    const name = util.filename(file);
    app.service[name] = Service;
    if (lcfirst(name) !== name && extra.lowerCasify) {
      app.service[lcfirst(name)] = Service;
    }
  }

  app.use(function* (next) {
    var _this = this;

    Object.keys(app.service).forEach(function (key) {
      return _this.$injector.register(key, app.service[key]);
    });
    yield next;
  });

  util.getFilesFromDir(servicePath).filter(function (x) {
    if (/spec.js/.test(x)) return false;
    return (/js$/.test(x));
  }).forEach(loadService);

  return {
    filter: /js$/,
    setup: function callback(files) {
      files.forEach(f => loadService(f));
    },
    watchCallback: function(path) {
      loadService(path);
    },
    name: 'service'
  };
};
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

