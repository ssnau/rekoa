/**
 * 支持热替换的中间件模块。
 * @type {exports|module.exports}
 */

var util = require('./util')
var path = require('path')
var compose = require('koa-compose')

function r (p) {
  var x = require(p)
  return (x && x.default) || x
}

function flatten (array) {
  return array.reduce((acc, arr) => {
    return acc.concat(Array.isArray(arr) ? flatten(arr) : arr)
  }, [])
}

module.exports = function (app, extra) {
  var middlewarePath = extra.path

  function getOrder () {
    var c1, c2
    util.safe(() => { c1 = r(path.join(middlewarePath, '_order.js')) })
    util.safe(() => { c2 = r(path.join(middlewarePath, '$order.js')) })
    return c1 || c2 || []
  }

  var mws = async function (context, next) { await next() }
  function setup (files) {
    var middlewareOrder = getOrder() || []
    console.log('order is', middlewareOrder)

    // read dir
    var wears = files.filter(function (x) {
      return (/(js|ts)$/.test(x))
    }).map(function (name) {
      return util.filename(name)
    }).filter(Boolean).filter(function (name) {
      return name.indexOf('$order') === -1 && name.indexOf('_order') === -1
    })

    // sort in order and require them
    wears = middlewareOrder.filter(x => wears.indexOf(x) > -1)

    console.log('loading middlewares:', wears.join(', '))

    wears = wears.map(function (name) {
      return r(path.join(middlewarePath, name))
    }).filter(Boolean)

    // flat and filter
    wears = flatten(wears).filter(Boolean)
    mws = compose(wears)
  }

  // wrap in a function to enable hot-replacement
  app.use(async function (context, next) {
    return mws(context, next)
  })

  return {
    setup,
    filter: /[.](ts|js)$/,
    fullReload: true,
    name: 'middleware'
  }
}
