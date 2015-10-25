/**
 * 支持热替换的中间件模块。
 * @type {exports|module.exports}
 */

var util = require('./util');
var path = require('path');
var compose = require('composition');
var _ = require('lodash');

module.exports = function (app, extra) {
  var middlewarePath = extra.path;
  var middlewareOrder = util.safe(function() {
    return require(path.join(middlewarePath, '$order.json'));
  }) || [];
  var mws = function *(next) { yield next};
  function initMws(files) {
    mws = compose(
      _.flatten(
      util.predefinedSort(
          files.map(function(name) {
            return util.filename(name);
          }),
        middlewareOrder
      )
        .map(function(name) {
          return require(path.join(middlewarePath, name));
        })
        .filter(Boolean)
      )
    );
  }

  app.use(function *(next) {
    yield mws.call(this, next);
  });

  return {
    setup: initMws,
    filter: /js$/,
    fullReload: true,
    name: 'middleware'
  };
};
