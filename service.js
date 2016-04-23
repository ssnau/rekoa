'use strict';

var injecting = require('injecting');
var util = require('./util');
// Service setup!
module.exports = function (app, extra) {
  var servicePath = extra.path;
  console.log('run into here..');
  // Data Injection setup!
  app.use(function* (next) {
    var _this = this;

    var injector = injecting();
    this.$injector = injector;
    this._use_data_injection = true;

    injector.register('context', this);
    injector.register('app', this.app);

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

    app.service[util.filename(file)] = Service;
  }

  app.use(function* (next) {
    var _this = this;

    if (this.$injector) {
      Object.keys(app.service).forEach(function (key) {
        return _this.$injector.register(key, app.service[key]);
      });
    }
    yield next;
  });

  util.getFilesFromDir(servicePath).filter(function (x) {
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
